import { Collection, Db, MongoClient } from "mongodb";
import { MenuModel } from "./models/menu";

const connectionString = "mongodb://admin:admin@host.docker.internal:27017";
const dbName = "mealistdb";
const restaurantCollection = "restaurants";

export const collections: { restaurants?: Collection, menus?: MenuModel[] } = {};

export async function connectToDatabase() {
  const client: MongoClient = new MongoClient(connectionString);
  await client.connect();
  const db: Db = client.db(dbName);
  const restaurantsCollection: Collection = db.collection(restaurantCollection);
  collections.restaurants = restaurantsCollection;
  collections.menus = [];
}
