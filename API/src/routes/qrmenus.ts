import { Operation } from "express-openapi";
import { components } from "../types/api";
import { collections } from "../db/connection";

type QrMenuResponseModel = components["schemas"]["QrMenu"];
type CreateQrMenuRequest = components["schemas"]["CreateQrMenuRequest"];

export const POST: Operation = [
    async (req, res) => {
        const qrMenu = req.body as CreateQrMenuRequest;

        const result = await collections.qrmenus!.insertOne(qrMenu);

        res.status(201).json(result.insertedId);
    },
];

POST.apiDoc = {
    description: "Create a new QR menu",
    operationId: "createQrMenu",
    tags: ["qrmenus"],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/CreateQrMenuRequest",
                },
            },
        },
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": {
                    schema: {
                        type: "string",
                    },
                },
            },
        },
    },
};

export const GET: Operation = [
    async (req, res) => {
        const qrMenus = await collections.qrmenus!.find().toArray();

        res.status(200).json(qrMenus);
    },
];

GET.apiDoc = {
    description: "Get all QR menus",
    operationId: "getQrMenus",
    tags: ["qrmenus"],
    responses: {
        200: {
            description: "List of QR menus",
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/QrMenu",
                        },
                    },
                },
            },
        },
    },
};