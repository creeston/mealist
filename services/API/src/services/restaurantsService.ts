import { IRestaurantsRepository } from '../interfaces/restaurantsRepository';
import { RestaurantModel } from '../models/restaurant';
import { components } from '../presentation/api';

type RestaurantApiModel = components['schemas']['Restaurant'];

export class RestaurantsService {
  constructor(private restaurantsRepository: IRestaurantsRepository) {}

  async createRestaurant(createRestaurantRequest: RestaurantApiModel) {
    const restaurant: RestaurantModel = {
      name: createRestaurantRequest.name,
      address: createRestaurantRequest.address,
      description: createRestaurantRequest.description,
      city: createRestaurantRequest.city,
      wifiName: createRestaurantRequest.wifiName,
      wifiPassword: createRestaurantRequest.wifiPassword,
      instagramUrl: createRestaurantRequest.instagramUrl,
      vkUrl: createRestaurantRequest.vkUrl,
      facebookUrl: createRestaurantRequest.facebookUrl,
      tripAdvisorUrl: createRestaurantRequest.tripAdvisorUrl,
    };

    return this.restaurantsRepository.createRestaurant(restaurant);
  }
  async getRestaurantById(restaurantId: string): Promise<RestaurantApiModel | null> {
    const restaurant = await this.restaurantsRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      return null;
    }

    return this.mapRestaurantToApiModel(restaurant);
  }

  async listRestaurants(): Promise<RestaurantApiModel[]> {
    const restaurants = await this.restaurantsRepository.listRestaurants();
    return restaurants.map((restaurant) => this.mapRestaurantToApiModel(restaurant));
  }

  async updateRestaurant(id: string, restaurant: RestaurantApiModel) {
    restaurant.id = id;
    return this.restaurantsRepository.updateRestaurant(restaurant);
  }

  private mapRestaurantToApiModel(restaurant: RestaurantModel): RestaurantApiModel {
    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      city: restaurant.city,
      description: restaurant.description,
      wifiName: restaurant.wifiName,
      wifiPassword: restaurant.wifiPassword,
      instagramUrl: restaurant.instagramUrl,
      vkUrl: restaurant.vkUrl,
      facebookUrl: restaurant.facebookUrl,
      tripAdvisorUrl: restaurant.tripAdvisorUrl,
    };
  }
}
