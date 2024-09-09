import { Operation } from 'express-openapi';
import { qrMenuService } from '../qrmenus';

export const GET: Operation = [
  async (req, res) => {
    const id = req?.params?.id;
    const qrMenu = qrMenuService.getQrMenuById(id);

    if (!qrMenu) {
      res.status(404).send(`QR Menu with id: ${id} not found`);
      return;
    }
    res.status(200).json(qrMenu);
  },
];

GET.apiDoc = {
  description: 'Get QR Menu',
  operationId: 'getQrMenu',
  tags: ['qrmenus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'QR Menu ID',
    },
  ],
  responses: {
    200: {
      description: 'QR Menu',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/QrMenu',
          },
        },
      },
    },
  },
};
