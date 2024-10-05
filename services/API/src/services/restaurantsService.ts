import { RestaurantsRepository } from '../data-access/repositories/restaurantsRepository';
import { Restaurant } from '../domain/models/restaurant';
import { components } from '../presentation/api';

type RestaurantApiModel = components['schemas']['Restaurant'];

export class RestaurantsService {
  constructor(private restaurantsRepository: RestaurantsRepository) {}

  async createRestaurant(createRestaurantRequest: RestaurantApiModel): Promise<RestaurantApiModel> {
    const result = await this.restaurantsRepository.createRestaurant(this.mapApiModelToDomain(createRestaurantRequest));
    return this.mapRestaurantToApiModel(result);
  }

  async getRestaurantById(restaurantId: string): Promise<RestaurantApiModel | null> {
    const restaurant = await this.restaurantsRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      return null;
    }

    return this.mapRestaurantToApiModel(restaurant);
  }

  async deleteRestaurant(restaurantId: string) {
    await this.restaurantsRepository.deleteRestaurant(restaurantId);
  }

  async listRestaurants(): Promise<RestaurantApiModel[]> {
    const restaurants = await this.restaurantsRepository.listRestaurants();
    return restaurants.map((restaurant) => this.mapRestaurantToApiModel(restaurant));
  }

  async updateRestaurant(id: string, updateRequest: RestaurantApiModel) {
    const restaurant = this.mapApiModelToDomain(updateRequest);
    restaurant.id = id;
    await this.restaurantsRepository.updateRestaurant(restaurant);
  }

  private mapApiModelToDomain(restaurant: RestaurantApiModel): Restaurant {
    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      city: restaurant.city,
      description: restaurant.description,
      wifiName: restaurant.wifiName,
      wifiPassword: restaurant.wifiPassword,
      instagramUrl: restaurant.instagramUrl,
      facebookUrl: restaurant.facebookUrl,
      tripAdvisorUrl: restaurant.tripAdvisorUrl,
    };
  }

  private mapRestaurantToApiModel(restaurant: Restaurant): RestaurantApiModel {
    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      city: restaurant.city,
      description: restaurant.description,
      wifiName: restaurant.wifiName,
      wifiPassword: restaurant.wifiPassword,
      instagramUrl: restaurant.instagramUrl,
      facebookUrl: restaurant.facebookUrl,
      tripAdvisorUrl: restaurant.tripAdvisorUrl,
    };
  }
}
