import { Request } from "express";
import { components } from "../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { collections } from "../db/connection";

type Restaurant = components["schemas"]["Restaurant"];
type CreateRestaurantRequest = components["schemas"]["CreateRestaurantRequest"];

export const GET: Operation = [
  (req: Request, res: Response): void => {
    const restaurants = collections.restaurants?.find({}).toArray() as
      | Restaurant[]
      | undefined;
    res.json(restaurants ?? []);
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
    const createRestaurantRequest = req.body as CreateRestaurantRequest;
    const restaurant: Restaurant = {
      id: createRestaurantRequest.name,
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
    result
      ? res
          .status(201)
          .send(
            `Successfully created a new restaurant with id ${result.insertedId}`
          )
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
