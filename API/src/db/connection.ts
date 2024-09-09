import { Collection, Db, MongoClient } from "mongodb";

const connectionString = "mongodb://admin:admin@host.docker.internal:27017";
const dbName = "mealistdb";
const restaurantCollection = "restaurants";
const menuCollection = "menus";
const qrmenuCollection = "qrmenus";

export const collections: { restaurants?: Collection, menus?: Collection, qrmenus?: Collection } = {};

export async function connectToDatabase() {
  const client: MongoClient = new MongoClient(connectionString);
  await client.connect();
  const db: Db = client.db(dbName);
  collections.restaurants = db.collection(restaurantCollection);;
  collections.menus = db.collection(menuCollection);
  collections.qrmenus = db.collection(qrmenuCollection);
}
