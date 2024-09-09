import { Upload } from '@aws-sdk/lib-storage';
import { IMenusRepository } from '../interfaces/menusRepository';
import { MenuModel, OcrBoxModel } from '../models/menu';
import { components } from '../presentation/api';
import { rabbitMQ } from '../queue/connection';
import { logger } from '../utils/logging/logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type MenuPageApiModel = components['schemas']['MenuPage'];
type MenuLineApiModel = components['schemas']['MenuLine'];
type MenuApiModel = components['schemas']['Menu'];
type CreateMenuRequest = components['schemas']['CreateMenuRequest'];

export const client = new S3Client({
  endpoint: 'http://127.0.0.1:9000',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
  region: 'europe-west1',
});

export class MenusService {
  constructor(private menusRepository: IMenusRepository) {}

  async createMenu(menu: CreateMenuRequest, file: any): Promise<void> {
    logger.log({
      level: 'info',
      message: 'Creating new menu',
    });

    const language = menu.language ? menu.language : 'eng';
    const menuName = menu.name ? menu.name : file.originalname;
    const newMenu: MenuModel = {
      name: menuName,
      creationDate: new Date().toISOString(),
      status: 'NOT_PARSED',
      language: language,
    };

    const createdMenu = await this.menusRepository.createMenu(newMenu);

    const key = 'RawMenus/' + newMenu.id + '/' + file.originalname;
    const bucket = 'mealist';
    let upload = new Upload({
      client: client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
      },
    });

    await upload.done();
    createdMenu.menuPath = key;

    await this.menusRepository.updateMenu(createdMenu);

    const channel = rabbitMQ.channel;

    if (channel) {
      var data = JSON.stringify(newMenu);
      channel.sendToQueue('menu-parsing-queue', Buffer.from(data));
    }

    createdMenu.status = 'PARSING_IN_PROGRESS';
    await this.menusRepository.updateMenu(createdMenu);

    logger.log({
      level: 'info',
      message: 'Menu created and sent to menu-parsing-queue',
    });
  }

  async getMenuById(menuId: string) {
    const menu = await this.menusRepository.getMenuById(menuId);
    return await this.menuToResponseModel(menu);
  }

  async listMenus() {
    const menus = await this.menusRepository.listMenus();
    if (!menus) {
      return [];
    }

    const menusReponse: MenuApiModel[] = await Promise.all(
      menus!.map(async (menu) => {
        const response = await this.menuToResponseModel(menu as MenuModel);
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
        menuPage.markup = page.markup.map(
          (line: MenuLineApiModel, i: number) => {
            return {
              blockId: i + '',
              text: line.text ?? '',
              box: {
                x1: line.x1,
                y1: line.y1,
                x2: line.x2,
                y2: line.y2,
              } as OcrBoxModel,
            };
          }
        );

        anyPageUpdated = true;
        logger.log(
          'info',
          `Updated page ${page.pageNumber} for menu ${menuId}`
        );
      }
    }

    if (anyPageUpdated) {
      menu.status = 'REVIEWED';
    }

    await this.menusRepository.updateMenu(menu);
  }

  private async menuToResponseModel(menu: MenuModel) {
    const command = new GetObjectCommand({
      Bucket: 'mealist',
      Key: menu.menuPath,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

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
        const getImageCommand = new GetObjectCommand({
          Bucket: 'mealist',
          Key: page.imagePath,
        });

        const imageUrl = await getSignedUrl(client, getImageCommand, {
          expiresIn: 3600,
        });
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
