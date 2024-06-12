import { Operation } from "express-openapi";
import { components } from "../types/api";
import { Response, Request } from "express";

type Menu = components["schemas"]["Menu"];

let menus: Menu[] = [];

export const GET: Operation = [
  (req: Request, res: Response): void => {
    res.json(menus);
  },
];

GET.apiDoc = {
  description: "Get Menus",
  operationId: "getMenus",
  tags: ["menus"],
  responses: {
    200: {
      description: "List of menus",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Menu",
            },
          },
        },
      },
    },
  },
};
