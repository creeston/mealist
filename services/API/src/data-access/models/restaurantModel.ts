import { model, Schema } from 'mongoose';
import { Restaurant } from '../../domain/models/restaurant';

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  description: String,
  wifiName: String,
  wifiPassword: String,
  instagramUrl: String,
  vkUrl: String,
  facebookUrl: String,
  tripAdvisorUrl: String,
});

export const RestaurantModel = model('Restaurant', RestaurantSchema);

export function mapToRestaurantModel(restaurant: Restaurant) {
  return {
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

export function mapToRestaurant(document: any): Restaurant {
  return {
    id: document._id.toString(),
    name: document.name,
    address: document.address,
    city: document.city,
    description: document.description,
    wifiName: document.wifiName,
    wifiPassword: document.wifiPassword,
    instagramUrl: document.instagramUrl,
    vkUrl: document.vkUrl,
    facebookUrl: document.facebookUrl,
    tripAdvisorUrl: document.tripAdvisorUrl,
  };
}
