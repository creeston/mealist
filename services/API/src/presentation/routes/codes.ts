import { Operation } from "express-openapi";
import { components } from "../api";
import { Response, Request } from "express";

type Code = components["schemas"]["Code"];

let codes: Code[] = [];

export const GET: Operation = [
  (req: Request, res: Response): void => {
    res.json(codes);
  },
];

GET.apiDoc = {
  description: "Get QR Codes",
  operationId: "getCodes",
  tags: ["code"],
  responses: {
    200: {
      description: "List of codes",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Code",
            },
          },
        },
      },
    },
  },
};
