import { IRestaurantsRepository } from '../../domain/interfaces/restaurantsRepository';
import { Restaurant } from '../../domain/models/restaurant';
import { RestaurantModel, mapToRestaurant, mapToRestaurantModel } from '../models/restaurantModel';

export class RestaurantsRepository implements IRestaurantsRepository {
  async createRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const restaurantDocument = new RestaurantModel(mapToRestaurantModel(restaurant));
    const result = await restaurantDocument.save();
    restaurant.id = result._id.toString();
    return restaurant;
  }

  async getRestaurantById(restaurantId: string): Promise<Restaurant> {
    const document = await RestaurantModel.findById(restaurantId);
    if (!document) {
      throw new Error('Restaurant not found');
    }
    return mapToRestaurant(document);
  }

  async listRestaurants(): Promise<Restaurant[]> {
    const documents = await RestaurantModel.find().exec();
    return documents.map(mapToRestaurant);
  }

  async updateRestaurant(restaurant: Restaurant): Promise<void> {
    const restaurantDocument = mapToRestaurantModel(restaurant);
    await RestaurantModel.findByIdAndUpdate(restaurant.id, restaurantDocument);
  }

  async deleteRestaurant(restaurantId: string): Promise<void> {
    await RestaurantModel.findByIdAndDelete(restaurantId);
  }
}
