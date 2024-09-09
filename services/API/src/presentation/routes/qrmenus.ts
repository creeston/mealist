import { Operation } from 'express-openapi';
import { components } from '../api';
import { qrMenusRepository } from '../../repositories/connection';
import { QrMenuService } from '../../services/qrMenuService';

type CreateQrMenuRequest = components['schemas']['CreateQrMenuRequest'];

export const qrMenuService = new QrMenuService(qrMenusRepository);

export const POST: Operation = [
  async (req, res) => {
    const creationRequest = req.body as CreateQrMenuRequest;
    const result = await qrMenuService.createQrMenu(creationRequest);
    res.status(201).json(result.id);
  },
];

POST.apiDoc = {
  description: 'Create a new QR menu',
  operationId: 'createQrMenu',
  tags: ['qrmenus'],
  requestBody: {
    content: {
      'application/json': {
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
    const qrMenus = await qrMenusRepository.listQrMenus();
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
