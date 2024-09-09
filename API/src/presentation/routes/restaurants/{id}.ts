import { Request } from 'express';
import { components } from '../../api';
import { Operation } from 'express-openapi';
import { Response } from 'express';
import { restaurantService } from '../restaurants';

type Restaurant = components['schemas']['Restaurant'];

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;

    const restaurant = restaurantService.getRestaurantById(id);
    restaurant ? res.status(200).json(restaurant) : res.status(404).send(`Restaurant with id: ${id} not found`);
  },
];

GET.apiDoc = {
  description: 'Get Restaurant',
  operationId: 'getRestaurant',
  tags: ['restaurants'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'Restaurant ID',
    },
  ],
  responses: {
    200: {
      description: 'Restaurant',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Restaurant',
          },
        },
      },
    },
  },
};

export const PUT: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const restaurantUpdate = req.body as Restaurant;
    await restaurantService.updateRestaurant(id, restaurantUpdate);
    res.status(200).send();
  },
];

PUT.apiDoc = {
  description: 'Update Restaurant',
  operationId: 'updateRestaurant',
  tags: ['restaurants'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'Restaurant ID',
    },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Restaurant',
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated Restaurant',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Restaurant',
          },
        },
      },
    },
  },
};
