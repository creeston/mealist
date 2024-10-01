import { CreateMenuCommand, Menu, MenuPage, UpdateMenuPageCommand } from '../domain/models/menu';
import { logError, logInfo } from '../utils/logging/logger';
import { StorageService } from '../data-access/storage/storageService';
import { MenuProcessingStatus } from '../domain/enums/menuProcessingStatus';
import { MenusRepository } from '../data-access/repositories/menusRepository';
import { MessageProducer } from '../queue/producer';

export class MenusService {
  constructor(
    private menusRepository: MenusRepository,
    private storageService: StorageService,
    private menuParsingProducer: MessageProducer
  ) {}

  async createMenu(command: CreateMenuCommand): Promise<string> {
    const menuName = command.name ? command.name : command.fileName;

    const createdMenu = await this.menusRepository.createMenu({
      name: menuName,
      creationDate: new Date().toISOString(),
      status: MenuProcessingStatus.NOT_PARSED,
      language: command.language,
    });

    createdMenu.menuPath = 'RawMenus/' + createdMenu.id + '/' + command.fileName;
    await this.storageService.uploadFile(createdMenu.menuPath, command.file);
    await this.menusRepository.updateMenu(createdMenu);

    this.menuParsingProducer.publishMenuParsingMessage(createdMenu);
    createdMenu.status = MenuProcessingStatus.PARSING_IN_PROGRESS;
    await this.menusRepository.updateMenu(createdMenu);

    return createdMenu.id!;
  }

  async getMenuById(menuId: string): Promise<Menu> {
    const menu = await this.menusRepository.getMenuById(menuId);
    return menu;
  }

  async listMenus(): Promise<Menu[]> {
    const menus = await this.menusRepository.listMenus();
    if (!menus) {
      return [];
    }

    return menus;
  }

  async updateMenuPages(menuId: string, updateCommands: UpdateMenuPageCommand[]) {
    const menu = await this.menusRepository.getMenuById(menuId);
    let anyPageUpdated = false;

    if (!menu.pages) {
      throw new Error(`Menu with id: ${menuId} does not have any pages`);
    }

    for (const command of updateCommands) {
      const menuPage = menu.pages.find((p) => p.pageNumber === command.pageNumber);
      if (menuPage && command.markup) {
        menuPage.markup = command.markup;
        anyPageUpdated = true;
        logInfo(`Updated page ${command.pageNumber} for menu ${menuId}`);
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
}
