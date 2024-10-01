import { Operation } from 'express-openapi';
import { components } from '../api';
import { Response, Request } from 'express';
import { MenusService } from '../../services/menusService';
import { StorageService } from '../../data-access/storage/storageService';
import { MessageProducer } from '../../queue/producer';
import { MessageConsumer } from '../../queue/consumer';
import { MenusRepository } from '../../data-access/repositories/menusRepository';
import { CreateMenuCommand, Menu, MenuLine, MenuPage, OcrBox } from '../../domain/models/menu';
import { MenuLanguage } from '../../domain/enums/menuLanguage';

type CreateMenuRequest = components['schemas']['CreateMenuRequest'];
type MenuPageApiModel = components['schemas']['MenuPage'];
type MenuLineApiModel = components['schemas']['MenuLine'];
type MenuApiModel = components['schemas']['Menu'];

const storageService = new StorageService();
export const menusService = new MenusService(new MenusRepository(), storageService, new MessageProducer());

export const listenToMenuParsingStatusQueue = () => {
  MessageConsumer.consumerMenuParsingMessage(async (data) => {
    await menusService.processMenuParsingStatus(data);
  });
};

export const listenToMenuOcrStatusQueue = () => {
  MessageConsumer.consumeOcrStatusQueue(async (data) => {
    await menusService.processMenuOcrStatus(data);
  });
};

export const GET: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const menus = await menusService.listMenus();
    const menusResponse = await Promise.all(menus.map((menu) => menuToResponseModel(menu)));
    res.json(menusResponse);
  },
];

GET.apiDoc = {
  description: 'Get Menus',
  operationId: 'getMenus',
  tags: ['menus'],
  responses: {
    200: {
      description: 'List of menus',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Menu',
            },
          },
        },
      },
    },
  },
};

export const POST: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const { body } = req;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No file uploaded' });
    }

    let file = files[0];
    const menu = body as CreateMenuRequest;
    const command = {
      name: menu.name,
      fileName: file.originalname,
      file: file.buffer,
      language: menu.language ? (menu.language as MenuLanguage) : MenuLanguage.ENG,
    } as CreateMenuCommand;
    await menusService.createMenu(command);

    res.status(201).json({ message: 'Menu created' });
  },
];

POST.apiDoc = {
  description: 'Create a new menu',
  operationId: 'createMenu',
  tags: ['menus'],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          $ref: '#/components/schemas/CreateMenuRequest',
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created menu',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Menu',
          },
        },
      },
    },
  },
};

export const menuToResponseModel = async (menu: Menu) => {
  const url = menu.menuPath ? await storageService.getFileUrl(menu.menuPath) : '';

  const response = {
    id: menu.id,
    name: menu.name,
    originalFileUrl: url,
    creationDate: menu.creationDate,
    moodifiedDate: menu.modifiedDate,
    status: menu.status,
  } as MenuApiModel;

  if (menu.pages && menu.pages.length > 0) {
    response.pages = await mapMenusPagesToApiModel(menu.pages);
  }

  return response;
};

export const mapMenusPagesToApiModel = async (pages: MenuPage[]): Promise<MenuPageApiModel[]> => {
  const apiPages: MenuPageApiModel[] = [];
  for (let page of pages) {
    apiPages.push(await mapMenuPageToApiModel(page));
  }
  return apiPages;
};

export const mapMenuPageToApiModel = async (page: MenuPage): Promise<MenuPageApiModel> => {
  const imageUrl = await storageService.getFileUrl(page.imagePath);
  const responseMarkup = page.markup?.map((line) => {
    return {
      text: line.text,
      x1: line.box.x1,
      y1: line.box.y1,
      x2: line.box.x2,
      y2: line.box.y2,
    } as MenuLineApiModel;
  });
  return {
    pageNumber: page.pageNumber,
    imageUrl: imageUrl,
    markup: responseMarkup,
  } as MenuPageApiModel;
};
