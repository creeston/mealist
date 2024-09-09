import { ObjectId } from "mongodb";
import { IRestaurantsRepository } from "../interfaces/restaurantsRepository";
import { RestaurantModel } from "../models/restaurant";
import { collections } from "./connection";

export class RestaurantsRepository implements IRestaurantsRepository {
    async createRestaurant(restaurant: RestaurantModel): Promise<RestaurantModel> {
        const result = await collections.restaurants!.insertOne(restaurant);
        restaurant.id = result.insertedId.toString();
        return restaurant;
    }

    async getRestaurantById(restaurantId: string): Promise<RestaurantModel> {
        const query = { _id: new ObjectId(restaurantId) };
        const document = await collections.restaurants!.findOne(query);
        if (!document) {
            throw new Error("Restaurant not found");
        }
        const { _id, ...rest } = document;
        const restaurant = rest as RestaurantModel;
        restaurant.id = _id.toString();
        return restaurant;
    }

    async listRestaurants(): Promise<RestaurantModel[]> {
        const documents = await collections.restaurants!.find().toArray();
        return documents.map((document) => {
            const { _id, ...rest } = document;
            const restaurant = rest as RestaurantModel;
            restaurant.id = _id.toString();
            return restaurant;
        });
    }

    async updateRestaurant(restaurant: RestaurantModel): Promise<void> {
        const query = { _id: new ObjectId(restaurant.id) };
        await collections.restaurants!.updateOne(query, { $set: restaurant });
    }
}