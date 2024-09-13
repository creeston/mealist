import { Operation } from 'express-openapi';
import { components } from '../api';
import { Response, Request } from 'express';
import { MenusService } from '../../services/menusService';
import { StorageService } from '../../data-access/storage/storageService';
import { MessageProducer } from '../../queue/producer';
import { MessageConsumer } from '../../queue/consumer';
import { MenusRepository } from '../../data-access/repositories/menusRepository';

type CreateMenuRequest = components['schemas']['CreateMenuRequest'];

export const menusService = new MenusService(new MenusRepository(), new StorageService(), new MessageProducer());

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
    res.json(menus);
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
    await menusService.createMenu(menu, file);

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
