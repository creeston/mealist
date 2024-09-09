import { Collection, Db, MongoClient } from "mongodb";
import { MenusRepository } from "./menusRepository";
import { RestaurantsRepository } from "./restaurantsRepository";
import { connectionString, dbName, menuCollection, qrmenuCollection, restaurantCollection } from "../config/db";
import { QrMenusRepository } from "./qrMenusRepository";

export const collections: { restaurants?: Collection, menus?: Collection, qrmenus?: Collection } = {};

export async function connectToDatabase() {
  const client: MongoClient = new MongoClient(connectionString);
  await client.connect();
  const db: Db = client.db(dbName);
  collections.restaurants = db.collection(restaurantCollection);;
  collections.menus = db.collection(menuCollection);
  collections.qrmenus = db.collection(qrmenuCollection);
}

export const menusRepository = new MenusRepository();
export const restaurantsRepository = new RestaurantsRepository();
export const qrMenusRepository = new QrMenusRepository();