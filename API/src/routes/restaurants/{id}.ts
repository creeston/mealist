import { Request } from "express";
import { components } from "../../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { collections } from "../../db/connection";
import { ObjectId } from "mongodb";

type Restaurant = components["schemas"]["Restaurant"];

export const PUT: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const restaurantUpdate = req.body as Restaurant;
    const query = { _id: new ObjectId(id) };
    const result = await collections.restaurants!.updateOne(query, {
      $set: restaurantUpdate,
    });

    result
      ? res.status(200).send(`Successfully updated game with id ${id}`)
      : res.status(304).send(`Game with id: ${id} not updated`);
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
