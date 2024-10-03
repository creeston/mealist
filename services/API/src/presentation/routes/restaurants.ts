import { Request, Router } from 'express';
import { components } from '../api';
import { Response } from 'express';
import { RestaurantsService } from '../../services/restaurantsService';
import { RestaurantsRepository } from '../../data-access/repositories/restaurantsRepository';

type RestaurantApiModel = components['schemas']['Restaurant'];

export const restaurantService = new RestaurantsService(new RestaurantsRepository());
export const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const restaurants = await restaurantService.listRestaurants();
  res.json(restaurants);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const restaurant = restaurantService.getRestaurantById(id);
  restaurant ? res.status(200).json(restaurant) : res.status(404).send(`Restaurant with id: ${id} not found`);
});

router.post('/', async (req: Request, res: Response) => {
  const createRestaurantRequest = req.body as RestaurantApiModel;
  await restaurantService.createRestaurant(createRestaurantRequest);
  res.status(201).send();
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id;
  await restaurantService.deleteRestaurant(id);
  res.status(200).send();
});
