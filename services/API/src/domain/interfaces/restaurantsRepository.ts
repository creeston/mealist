import { Restaurant } from '../models/restaurant';

export interface IRestaurantsRepository {
  createRestaurant(restaurant: Restaurant): Promise<Restaurant>;
  getRestaurantById(restaurantId: string): Promise<Restaurant>;
  listRestaurants(): Promise<Restaurant[]>;
  updateRestaurant(restaurant: Restaurant): Promise<void>;
}
