import { Request } from "express";
import { components } from "../../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { restaurants } from "../restaurants";

type Restaurant = components["schemas"]["Restaurant"];

export const PUT: Operation = [
  (req: Request, res: Response): void => {
    const restaurant = restaurants.find(
      (t) => t.id === parseInt(req.params.id)
    );

    if (!restaurant) {
      res.status(404).send("Task not found");
    } else {
      const restaurantUpdate = req.body as Restaurant;
      restaurant.name = restaurantUpdate.name;
      restaurant.description = restaurantUpdate.description;
      restaurant.address = restaurantUpdate.address;
      restaurant.city = restaurantUpdate.city;
      restaurant.mapsView = restaurantUpdate.mapsView;
      restaurant.wifiName = restaurantUpdate.wifiName;
      restaurant.wifiPassword = restaurantUpdate.wifiPassword;
      restaurant.instagramUrl = restaurantUpdate.instagramUrl;
      restaurant.vkUrl = restaurantUpdate.vkUrl;
      restaurant.facebookUrl = restaurantUpdate.facebookUrl;
      restaurant.tripAdvisorUrl = restaurantUpdate.tripAdvisorUrl;

      res.json(restaurant);
    }
  },
];

PUT.apiDoc = {
  description: "Update Restaurant",
  operationId: "updateRestaurant",
  tags: ["restaurants"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: {
        type: "integer",
      },
      description: "Restaurant ID",
    },
  ],
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
    200: {
      description: "Updated Restaurant",
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
