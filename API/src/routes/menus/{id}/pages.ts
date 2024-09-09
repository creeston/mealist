import { Operation } from "express-openapi";
import { components } from "../../../types/api";
import { collections } from "../../../db/connection";
import { MenuLineModel, MenuModel, OcrBoxModel } from "../../../db/models/menu";
import { logger } from "../../../logging/logger";
import { ObjectId } from "mongodb";

type MenuPageApiModel = components["schemas"]["MenuPage"];
type MenuLineApiModel = components["schemas"]["MenuLine"];

export const PUT: Operation = [
    async (req, res) => {
        const menuId = req?.params?.id;
        const pages = req.body as MenuPageApiModel[];

        const query = { _id: new ObjectId(menuId) };
        const document = await collections.menus!.findOne(query);

        if (!document) {
            res.status(404).send(`Menu with id: ${menuId} not found`);
            return;
        }

        const { _id, ...rest } = document;

        const menu = rest as MenuModel;

        if (!menu.pages) {
            res.status(404).send(`Menu with id: ${menuId} does not have any pages`);
            return;
        }

        let anyPageUpdated = false;

        for (const page of pages) {
            const menuPage = menu.pages.find(p => p.pageNumber === page.pageNumber);
            if (menuPage && page.markup) {
                menuPage.markup = page.markup.map((line: MenuLineApiModel, i: number) => {
                    return {
                        blockId: i + "",
                        text: line.text ?? "",
                        box: {
                            x1: line.x1,
                            y1: line.y1,
                            x2: line.x2,
                            y2: line.y2
                        } as OcrBoxModel
                    };
                });

                anyPageUpdated = true;
                logger.log('info', `Updated page ${page.pageNumber} for menu ${menuId}`);
            }
        }


        if (anyPageUpdated) {
            menu.status = 'REVIEWED'
        }

        await collections.menus!.updateOne(query, { $set: menu });

        res.status(200).send();
    },
];


PUT.apiDoc = {
    description: "Update Menu Pages",
    operationId: "updateMenuPages",
    tags: ["menus"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "Menu ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: {
                        $ref: "#/components/schemas/MenuPage",
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Menu Pages Updated",
        },
    },
};