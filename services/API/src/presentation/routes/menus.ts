import { components } from '../api';
import { MenusService } from '../../services/menusService';
import { StorageService } from '../../data-access/storage/storageService';
import { MessageProducer } from '../../queue/producer';
import { MessageConsumer } from '../../queue/consumer';
import { MenusRepository } from '../../data-access/repositories/menusRepository';
import { CreateMenuCommand, Menu, MenuLine, MenuPage, OcrBox, UpdateMenuPageCommand } from '../../domain/models/menu';
import { MenuLanguage } from '../../domain/enums/menuLanguage';
import { Router } from 'express';
import multer = require('multer');

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

export const router = Router();
const upload = multer();

router.get('/', async (req, res) => {
  const menus = await menusService.listMenus();
  const menusResponse = await Promise.all(menus.map((menu) => menuToResponseModel(menu)));
  res.json(menusResponse);
});

router.get('/:id', async (req, res) => {
  const id = req?.params?.id;
  const menu = await menusService.getMenuById(id);
  const menuResponse = await menuToResponseModel(menu);
  res.status(200).json(menuResponse);
});

router.put('/:id/pages', async (req, res) => {
  const menuId = req?.params?.id;
  const pages = req.body as MenuPageApiModel[];

  const pagesDomainModel = pages.map(mapPageApiModelToDomainModel);
  await menusService.updateMenuPages(menuId, pagesDomainModel);
  res.status(200).send();
});

router.post('/', upload.any(), async (req, res) => {
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
});

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

export const mapPageApiModelToDomainModel = (page: MenuPageApiModel): UpdateMenuPageCommand => {
  return {
    pageNumber: page.pageNumber,
    markup: page.markup ? mapMarkupToDomain(page.markup) : [],
  };
};

export const mapMarkupToDomain = (markup: MenuLineApiModel[]): MenuLine[] => {
  return markup.map((line: MenuLineApiModel, i: number) => {
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
};
