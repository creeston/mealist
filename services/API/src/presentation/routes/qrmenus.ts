import { Operation } from 'express-openapi';
import { components } from '../api';
import { QrMenuService } from '../../services/qrMenuService';
import { QrMenusRepository } from '../../data-access/repositories/qrMenusRepository';
import { StorageService } from '../../data-access/storage/storageService';
import { MenusRepository } from '../../data-access/repositories/menusRepository';
import { logInfo } from '../../utils/logging/logger';
import { menusService } from './menus';

type CreateQrMenuRequest = components['schemas']['CreateQrMenuRequest'];

export const qrMenuService = new QrMenuService(
  menusService,
  new QrMenusRepository(),
  new StorageService(),
  new MenusRepository()
);

export const POST: Operation = [
  async (req, res) => {
    const { body } = req;
    const files = req.files as Express.Multer.File[];
    const customLoadingPlaceholderFile = files[0];
    const creationRequest = body as CreateQrMenuRequest;
    const result = await qrMenuService.createQrMenu(creationRequest, customLoadingPlaceholderFile);
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
      res.status(200).json([qrMenu]);
      return;
    }
    const qrMenus = await qrMenuService.listQrMenus();
    res.status(200).json(qrMenus);
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
