import { RestaurantModel } from "../models/restaurant";

export interface IRestaurantsRepository {
    createRestaurant(restaurant: RestaurantModel): Promise<RestaurantModel>;
    getRestaurantById(restaurantId: string): Promise<RestaurantModel>;
    listRestaurants(): Promise<RestaurantModel[]>;
    updateRestaurant(restaurant: RestaurantModel): Promise<void>;
}