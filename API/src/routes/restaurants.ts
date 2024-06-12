import { Request } from "express";
import { components } from "../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";

type Restaurant = components["schemas"]["Restaurant"];
type CreateRestaurantRequest = components["schemas"]["CreateRestaurantRequest"];

export const restaurants: Restaurant[] = [];

export const GET: Operation = [
  (req: Request, res: Response): void => {
    res.json(restaurants);
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
  (req: Request, res: Response): void => {
    const createRestaurantRequest = req.body as CreateRestaurantRequest;
    const restaurant: Restaurant = {
      id: restaurants.length + 1,
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

    restaurants.push(restaurant);
    res.status(201).json(restaurant);
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
          $ref: "#/components/schemas/CreateRestaurantRequest",
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
