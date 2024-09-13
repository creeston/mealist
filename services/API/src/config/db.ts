const connectionString = 'mongodb://admin:admin@host.docker.internal:27017/mealistdb';
const dbName = 'mealistdb';
const restaurantCollection = 'restaurants';
const menuCollection = 'menus';
const qrmenuCollection = 'qrmenus';

export { connectionString, dbName, restaurantCollection, menuCollection, qrmenuCollection };

import { MenusRepository } from '../data-access/repositories/menusRepository';
import { RestaurantsRepository } from '../data-access/repositories/restaurantsRepository';
import { QrMenusRepository } from '../data-access/repositories/qrMenusRepository';
import mongoose from 'mongoose';

export async function connectToDatabase() {
  await mongoose.connect(connectionString);
}

export const menusRepository = new MenusRepository();
export const restaurantsRepository = new RestaurantsRepository();
export const qrMenusRepository = new QrMenusRepository();
