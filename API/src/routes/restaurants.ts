import { Request } from "express";
import { components } from "../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { collections } from "../db/connection";
import { RestaurantModel } from "../db/models/restaurant";

type RestaurantApiModel = components["schemas"]["Restaurant"];

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const restaurants = await collections.restaurants?.find({}).toArray();
    if (!restaurants) {
      res.json([]);
    }

    const restaurantsModels = restaurants!.map((restaurant) => {
      const { _id, ...rest } = restaurant;

      return {
        id: _id.toString(),
        name: rest.name,
        address: rest.address,
        city: rest.city,
        description: rest.description,
        mapsView: rest.mapsView,
        wifiName: rest.wifiName,
        wifiPassword: rest.wifiPassword,
        instagramUrl: rest.instagramUrl,
        vkUrl: rest.vkUrl,
        facebookUrl: rest.facebookUrl,
        tripAdvisorUrl: rest.tripAdvisorUrl,
      } as RestaurantApiModel;
    });
    res.json(restaurantsModels);
  },
];

GET.apiDoc = {
  description: "Get all restaurants",
  operationId: "getRestaurants",
  tags: ["restaurants"],
  responses: {
    200: {
      description: "List of restaurants",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Restaurant",
            },
          },
        },
      },
    },
  },
};

export const POST: Operation = [
  async (req: Request, res: Response) => {
    const createRestaurantRequest = req.body as RestaurantApiModel;
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

    const result = await collections.restaurants!.insertOne(restaurant);
    restaurant.id = result.insertedId.toString();
    result
      ? res.status(201).json(restaurant)
      : res.status(500).send("Failed to create a new restaurant.");
  },
];

POST.apiDoc = {
  description: "Create Restaurant",
  operationId: "createRestaurant",
  tags: ["restaurants"],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Restaurant",
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created Restaurant",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Restaurant",
          },
        },
      },
    },
  },
};