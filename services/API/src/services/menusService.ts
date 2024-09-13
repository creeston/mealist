import { Menu, MenuPage, OcrBox } from '../domain/models/menu';
import { components } from '../presentation/api';
import { logError, logInfo } from '../utils/logging/logger';
import { StorageService } from '../data-access/storage/storageService';
import { MenuLanguage } from '../domain/enums/menuLanguage';
import { MenuProcessingStatus } from '../domain/enums/menuProcessingStatus';
import { MenusRepository } from '../data-access/repositories/menusRepository';
import { MessageProducer } from '../queue/producer';

type MenuPageApiModel = components['schemas']['MenuPage'];
type MenuLineApiModel = components['schemas']['MenuLine'];
type MenuApiModel = components['schemas']['Menu'];
type CreateMenuRequest = components['schemas']['CreateMenuRequest'];

export class MenusService {
  constructor(
    private menusRepository: MenusRepository,
    private storageService: StorageService,
    private menuParsingProducer: MessageProducer
  ) {}

  async createMenu(menu: CreateMenuRequest, file: any): Promise<MenuApiModel> {
    const language = menu.language ? (menu.language as MenuLanguage) : MenuLanguage.ENG;
    const menuName = menu.name ? menu.name : file.originalname;

    const createdMenu = await this.menusRepository.createMenu({
      name: menuName,
      creationDate: new Date().toISOString(),
      status: MenuProcessingStatus.NOT_PARSED,
      language: language,
    });

    createdMenu.menuPath = 'RawMenus/' + createdMenu.id + '/' + file.originalname;
    await this.storageService.uploadFile(createdMenu.menuPath, file.buffer);
    await this.menusRepository.updateMenu(createdMenu);

    this.menuParsingProducer.publishMenuParsingMessage(createdMenu);
    createdMenu.status = MenuProcessingStatus.PARSING_IN_PROGRESS;
    await this.menusRepository.updateMenu(createdMenu);

    return this.menuToResponseModel(createdMenu);
  }

  async getMenuById(menuId: string): Promise<MenuApiModel> {
    const menu = await this.menusRepository.getMenuById(menuId);
    return await this.menuToResponseModel(menu);
  }

  async listMenus(): Promise<MenuApiModel[]> {
    const menus = await this.menusRepository.listMenus();
    if (!menus) {
      return [];
    }

    const menusReponse: MenuApiModel[] = await Promise.all(
      menus!.map(async (menu) => {
        const response = await this.menuToResponseModel(menu as Menu);
        return response;
      })
    );

    return menusReponse;
  }

  async updateMenuPages(menuId: string, pages: MenuPageApiModel[]) {
    const menu = await this.menusRepository.getMenuById(menuId);
    let anyPageUpdated = false;

    if (!menu.pages) {
      throw new Error(`Menu with id: ${menuId} does not have any pages`);
    }

    for (const page of pages) {
      const menuPage = menu.pages.find((p) => p.pageNumber === page.pageNumber);
      if (menuPage && page.markup) {
        menuPage.markup = page.markup.map((line: MenuLineApiModel, i: number) => {
          return {
            blockId: i + '',
            text: line.text ?? '',
            box: {
              x1: line.x1,
              y1: line.y1,
              x2: line.x2,
              y2: line.y2,
            } as OcrBox,
          };
        });

        anyPageUpdated = true;
        logInfo(`Updated page ${page.pageNumber} for menu ${menuId}`);
      }
    }

    if (anyPageUpdated) {
      menu.status = MenuProcessingStatus.REVIEWED;
    }

    await this.menusRepository.updateMenu(menu);
  }

  async processMenuParsingStatus(data: any): Promise<void> {
    if (!data.paths) {
      logError('Paths not found');
      return;
    }

    const menuId = data.menuId as string;
    const menu = await this.menusRepository.getMenuById(menuId);
    if (!menu) {
      logError('Menu not found');
      return;
    }

    menu.modifiedDate = new Date().toISOString();
    menu.pages = data.paths.map((path: string, i: number) => {
      return {
        pageNumber: i,
        imagePath: path,
      };
    });
    menu.status = MenuProcessingStatus.PARSING_COMPLETED;
    await this.menusRepository.updateMenu(menu);

    logInfo('Menu updated with image urls');

    menu.pages!.forEach((page: MenuPage) => {
      this.menuParsingProducer.publishOcrRequest(menu.id!, page.pageNumber, page.imagePath, menu.language);
    });

    logInfo('Sent ocr requests to menu-ocr-queue');
    menu.status = MenuProcessingStatus.OCR_IN_PROGRESS;
    this.menusRepository.updateMenu(menu);
  }

  async processMenuOcrStatus(data: any): Promise<void> {
    const menuId = data.menuId as string;
    const menu = await this.menusRepository.getMenuById(menuId);
    if (!menu) {
      logError('Menu not found');
      return;
    }

    const pageNumber = data.menuPage;

    if (!menu.pages || pageNumber > menu.pages.length) {
      logError('Pages not found');
      return;
    }

    menu.modifiedDate = new Date().toISOString();
    menu.pages[pageNumber].markup = data.data.map((block: any) => {
      return {
        blockId: block.blockId,
        text: block.text,
        box: block.box,
      };
    });

    if (menu.pages.every((menu) => menu.markup)) {
      menu.status = MenuProcessingStatus.OCR_COMPLETED;
    }

    await this.menusRepository.updateMenu(menu);
    logInfo(`Menu page ${pageNumber} updated with ocr data`);
  }

  private async menuToResponseModel(menu: Menu) {
    const url = menu.menuPath ? await this.storageService.getFileUrl(menu.menuPath) : '';

    const response = {
      id: menu.id,
      name: menu.name,
      originalFileUrl: url,
      creationDate: menu.creationDate,
      moodifiedDate: menu.modifiedDate,
      status: menu.status,
    } as MenuApiModel;

    if (menu.pages && menu.pages.length > 0) {
      const pages: MenuPageApiModel[] = [];
      for (let page of menu.pages) {
        const imageUrl = await this.storageService.getFileUrl(page.imagePath);
        const responseMarkup = page.markup?.map((line) => {
          return {
            text: line.text,
            x1: line.box.x1,
            y1: line.box.y1,
            x2: line.box.x2,
            y2: line.box.y2,
          } as MenuLineApiModel;
        });
        pages.push({
          pageNumber: page.pageNumber,
          imageUrl: imageUrl,
          markup: responseMarkup,
        } as MenuPageApiModel);
      }

      response.pages = pages;
    }

    return response;
  }
}
