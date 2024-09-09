import { Operation } from "express-openapi";
import { collections } from "../../db/connection";
import { ObjectId } from "mongodb";

export const GET: Operation = [
    async (req, res) => {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const qrMenus = await collections.qrmenus!.findOne(query);
        res.status(200).json(qrMenus);
    },
];

GET.apiDoc = {
    description: "Get QR Menu",
    operationId: "getQrMenu",
    tags: ["qrmenus"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "QR Menu ID",
        },
    ],
    responses: {
        200: {
            description: "QR Menu",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/QrMenu",
                    },
                },
            },
        },
    },
};