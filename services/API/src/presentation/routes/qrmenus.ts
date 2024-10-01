import { Operation } from 'express-openapi';
import { components } from '../api';
import { QrMenuService } from '../../services/qrMenuService';
import { QrMenusRepository } from '../../data-access/repositories/qrMenusRepository';
import { StorageService } from '../../data-access/storage/storageService';
import { MenusRepository } from '../../data-access/repositories/menusRepository';
import { logInfo } from '../../utils/logging/logger';
import { mapMenusPagesToApiModel, menuToResponseModel } from './menus';
import { CreateQrMenuCommand, CreateQrMenuItemCommand, QrMenu } from '../../domain/models/qrmenu';

type CreateQrMenuRequest = components['schemas']['CreateQrMenuRequest'];
type QrMenuResponseModel = components['schemas']['QrMenu'];
type QrMenuItemResponseModel = components['schemas']['QrMenuItem'];

const storageService = new StorageService();
const menusRepository = new MenusRepository();
const qrMenusRepository = new QrMenusRepository();
export const qrMenuService = new QrMenuService(qrMenusRepository, storageService, menusRepository);

export const POST: Operation = [
  async (req, res) => {
    const { body } = req;
    const files = req.files as Express.Multer.File[];
    const customLoadingPlaceholderFile = files[0];
    const creationRequest = body as CreateQrMenuRequest;
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
      customLoadingPlaceholder: customLoadingPlaceholderFile.buffer,
    } as CreateQrMenuCommand;

    const result = await qrMenuService.createQrMenu(createCommand);
    res.status(201).json(result);
  },
];

POST.apiDoc = {
  description: 'Create a new QR menu',
  operationId: 'createQrMenu',
  tags: ['qrmenus'],
  requestBody: {
    content: {
      'multipart/form-data': {
        schema: {
          $ref: '#/components/schemas/CreateQrMenuRequest',
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': {
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const GET: Operation = [
  async (req, res) => {
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
  },
];

GET.apiDoc = {
  description: 'Get all QR menus',
  operationId: 'getQrMenus',
  tags: ['qrmenus'],
  responses: {
    200: {
      description: 'List of QR menus',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/QrMenu',
            },
          },
        },
      },
    },
  },
};

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
    restaurant: qrMenu.restaurant,
    sectionsToShow: qrMenu.sectionsToShow,
    style: qrMenu.style,
    scanCount: qrMenu.stats.scanCount,
    loadingPlaceholderUrl: loadingPlaceholderUrl,
    urlSuffix: qrMenu.urlSuffix,
    menus: menus,
    creationDate: qrMenu.creationDate,
    modificationDate: qrMenu.modificationDate,
  };
};
