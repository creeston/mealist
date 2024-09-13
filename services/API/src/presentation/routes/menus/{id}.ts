import { Request } from 'express';
import { Operation } from 'express-openapi';
import { Response } from 'express';
import { menusService } from '../menus';

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const menuResponse = await menusService.getMenuById(id);
    res.status(200).json(menuResponse);
  },
];

GET.apiDoc = {
  description: 'Get Menu',
  operationId: 'getMenu',
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
  responses: {
    200: {
      description: 'Menu',
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
