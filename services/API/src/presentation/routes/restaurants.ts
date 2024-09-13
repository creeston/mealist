import { Request } from 'express';
import { components } from '../api';
import { Operation } from 'express-openapi';
import { Response } from 'express';
import { RestaurantsService } from '../../services/restaurantsService';
import { RestaurantsRepository } from '../../data-access/repositories/restaurantsRepository';

type RestaurantApiModel = components['schemas']['Restaurant'];

export const restaurantService = new RestaurantsService(new RestaurantsRepository());

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const restaurants = await restaurantService.listRestaurants();
    res.json(restaurants);
  },
];

GET.apiDoc = {
  description: 'Get all restaurants',
  operationId: 'getRestaurants',
  tags: ['restaurants'],
  responses: {
    200: {
      description: 'List of restaurants',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Restaurant',
            },
          },
        },
      },
    },
  },
};

export const POST: Operation = [
  async (req: Request, res: Response) => {
    const createRestaurantRequest = req.body as RestaurantApiModel;
    await restaurantService.createRestaurant(createRestaurantRequest);
    res.status(201).send();
  },
];

POST.apiDoc = {
  description: 'Create Restaurant',
  operationId: 'createRestaurant',
  tags: ['restaurants'],
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
    201: {
      description: 'Created Restaurant',
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
