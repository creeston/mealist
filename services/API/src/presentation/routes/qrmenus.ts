import { components } from '../api';
import { QrMenuService } from '../../services/qrMenuService';
import { QrMenusRepository } from '../../data-access/repositories/qrMenusRepository';
import { StorageService } from '../../data-access/storage/storageService';
import { logInfo } from '../../utils/logging/logger';
import { menusService, menuToResponseModel } from './menus';
import { CreateQrMenuCommand, CreateQrMenuItemCommand, QrMenu, UpdateQrMenuCommand } from '../../domain/models/qrmenu';
import { Router } from 'express';
import multer = require('multer');
import { restaurantService } from './restaurants';

const upload = multer();

type CreateQrMenuRequest = components['schemas']['CreateQrMenuRequest'];
type UpdateQrMenuRequest = components['schemas']['UpdateQrMenuRequest'];
type QrMenuResponseModel = components['schemas']['QrMenu'];
type QrMenuItemResponseModel = components['schemas']['QrMenuItem'];

const storageService = new StorageService();
const qrMenusRepository = new QrMenusRepository();
export const qrMenuService = new QrMenuService(qrMenusRepository, storageService, menusService, restaurantService);

export const router = Router();

router.get('/', async (req, res) => {
  const urlSuffix = req.query.urlSuffix as string;
  logInfo(`GET /qrmenus urlSuffix: ${urlSuffix}`);
  if (urlSuffix) {
    const qrMenu = await qrMenuService.getQrMenuByUrlSuffix(urlSuffix);
    if (!qrMenu) {
      res.status(404).send();
      return;
    }
    res.status(200).json([await mapDomainToApiModel(qrMenu)]);
    return;
  }
  const qrMenus = await qrMenuService.listQrMenus();
  const qrMenusResponse = await Promise.all(qrMenus.map(mapDomainToApiModel));
  res.status(200).json(qrMenusResponse);
});

router.get('/:id', async (req, res) => {
  const id = req?.params?.id;
  const qrMenu = await qrMenuService.getQrMenuById(id);

  if (!qrMenu) {
    res.status(404).send(`QR Menu with id: ${id} not found`);
    return;
  }

  const response = await mapDomainToApiModel(qrMenu);
  res.status(200).json(response);
});

router.post('/', upload.any(), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const createRequestFile = files.find((file) => file.fieldname === 'createRequest');
  const customLoadingPlaceholderFile = files.find((file) => file.fieldname === 'file');

  if (!createRequestFile) {
    res.status(400).json({ error: 'No createRequest attached in multipart request' });
    return;
  }

  const body = JSON.parse(createRequestFile.buffer.toString());
  const creationRequest = body as CreateQrMenuRequest;

  if (!creationRequest) {
    res.status(400).json({ error: 'No request body' });
    return;
  }

  const createCommand = {
    name: creationRequest.name,
    urlSuffix: creationRequest.urlSuffix,
    title: creationRequest.title,
    restaurantId: creationRequest.restaurantId,
    sectionsToShow: creationRequest.sectionsToShow,
    style: creationRequest.style,
    menus: creationRequest.menus.map(
      (menu) =>
        ({
          menuId: menu.menuId,
          title: menu.title,
        } as CreateQrMenuItemCommand)
    ),
    loadingPlaceholderMenuIndex: creationRequest.loadingPlaceholder.menuIndex,
    customLoadingPlaceholder: customLoadingPlaceholderFile?.buffer,
  } as CreateQrMenuCommand;

  try {
    const result = await qrMenuService.createQrMenu(createCommand);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put('/:id', upload.any(), async (req, res) => {
  const id = req?.params?.id;
  const files = req.files as Express.Multer.File[];
  const updateRequestFile = files.find((file) => file.fieldname === 'updateRequest');
  const customLoadingPlaceholderFile = files.find((file) => file.fieldname === 'file');

  if (!updateRequestFile) {
    res.status(400).json({ error: 'No createRequest attached in multipart request' });
    return;
  }

  const body = JSON.parse(updateRequestFile.buffer.toString());
  const updateRequest = body as UpdateQrMenuRequest;

  if (!updateRequest) {
    res.status(400).json({ error: 'No request body' });
    return;
  }

  const updateCommand = {
    name: updateRequest.name,
    urlSuffix: updateRequest.urlSuffix,
    title: updateRequest.title,
    restaurantId: updateRequest.restaurantId,
    sectionsToShow: updateRequest.sectionsToShow,
    style: updateRequest.style,
    menus: updateRequest.menus.map(
      (menu) =>
        ({
          menuId: menu.menuId,
          title: menu.title,
        } as CreateQrMenuItemCommand)
    ),
    loadingPlaceholderMenuIndex: updateRequest.loadingPlaceholder.menuIndex,
    customLoadingPlaceholder: customLoadingPlaceholderFile?.buffer,
  } as UpdateQrMenuCommand;

  try {
    await qrMenuService.updateQrMenu(id, updateCommand);
    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = req?.params?.id;
  await qrMenuService.deleteQrMenu(id);
  res.status(204).send();
});

const mapDomainToApiModel = async (qrMenu: QrMenu): Promise<QrMenuResponseModel> => {
  const loadingPlaceholderUrl = await storageService.getFileFromPublicBucket(qrMenu.loadingPlaceholderKey);
  const menus: QrMenuItemResponseModel[] = [];
  for (const item of qrMenu.menus) {
    if (!item.menu.pages) {
      continue;
    }

    const menu = await menuToResponseModel(item.menu);
    menus.push({
      stopColor: item.stopColor,
      stopStyle: item.stopStyle,
      title: item.title,
      menu: menu,
    });
  }

  return {
    id: qrMenu.id,
    name: qrMenu.name,
    title: qrMenu.title,
    restaurant: qrMenu.restaurant,
    sectionsToShow: qrMenu.sectionsToShow,
    style: qrMenu.style,
    scanCount: qrMenu.stats.scanCount,
    loadingPlaceholderUrl: loadingPlaceholderUrl,
    loadingPlaceholderMenuIndex: qrMenu.loadingPlaceholderMenuIndex,
    urlSuffix: qrMenu.urlSuffix,
    menus: menus,
    creationDate: qrMenu.creationDate,
    modificationDate: qrMenu.modificationDate,
  };
};
