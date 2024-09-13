import { Operation } from 'express-openapi';
import { components } from '../../../api';
import { menusService } from '../../menus';

type MenuPageApiModel = components['schemas']['MenuPage'];

export const PUT: Operation = [
  async (req, res) => {
    const menuId = req?.params?.id;
    const pages = req.body as MenuPageApiModel[];

    await menusService.updateMenuPages(menuId, pages);
    res.status(200).send();
  },
];

PUT.apiDoc = {
  description: 'Update Menu Pages',
  operationId: 'updateMenuPages',
  tags: ['menus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'Menu ID',
    },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/MenuPage',
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Menu Pages Updated',
    },
  },
};
