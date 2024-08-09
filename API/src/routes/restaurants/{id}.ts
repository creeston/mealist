import { Request } from "express";
import { components } from "../../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { collections } from "../../db/connection";
import { ObjectId } from "mongodb";

type Restaurant = components["schemas"]["Restaurant"];

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const restaurant = await collections.restaurants!.findOne(query);

    restaurant
      ? res.status(200).json(restaurant)
      : res.status(404).send(`Restaurant with id: ${id} not found`);
  },
];

GET.apiDoc = {
  description: "Get Restaurant",
  operationId: "getRestaurant",
  tags: ["restaurants"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
      description: "Restaurant ID",
    },
  ],
  responses: {
    200: {
      description: "Restaurant",
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

export const PUT: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const restaurantUpdate = req.body as Restaurant;
    const query = { _id: new ObjectId(id) };
    const result = await collections.restaurants!.updateOne(query, {
      $set: restaurantUpdate,
    });

    restaurantUpdate.id = id;

    result
      ? res.status(200).json(restaurantUpdate)
      : res.status(304).send(`Restaurant with id: ${id} not updated`);
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
        type: "string",
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

export const DELETE: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await collections.restaurants!.deleteOne(query);

    result
      ? res.status(204).send()
      : res.status(404).send(`Restaurant with id: ${id} not found`);
  },
];

DELETE.apiDoc = {
  description: "Delete Restaurant",
  operationId: "deleteRestaurant",
  tags: ["restaurants"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
      description: "Restaurant ID",
    },
  ],
  responses: {
    204: {
      description: "Deleted Restaurant",
    },
  },
};
