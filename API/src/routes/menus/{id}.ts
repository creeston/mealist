import { Request } from "express";
import { components } from "../../types/api";
import { Operation } from "express-openapi";
import { Response } from "express";
import { collections } from "../../db/connection";
import { ObjectId } from "mongodb";
import { MenuModel } from "../../db/models/menu";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type MenuApiModel = components["schemas"]["Menu"];
type MenuPageResponseModel = components["schemas"]["MenuPage"];
type MenuLineResponseModel = components["schemas"]["MenuLine"];

export const client = new S3Client({
  endpoint: "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  region: "europe-west1"
})

export const menuToResponseModel = async (menu: MenuModel) => {
  const command = new GetObjectCommand({
    Bucket: "mealist",
    Key: menu.menuPath,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  const response = {
    id: menu.id,
    name: menu.name,
    originalFileUrl: url,
    creationDate: menu.creationDate,
    moodifiedDate: menu.modifiedDate,
    status: menu.status
  } as MenuApiModel;

  if (menu.pages && menu.pages.length > 0) {
    const pages: MenuPageResponseModel[] = [];
    for (let page of menu.pages) {
      const getImageCommand = new GetObjectCommand({
        Bucket: "mealist",
        Key: page.imagePath,
      });

      const imageUrl = await getSignedUrl(client, getImageCommand, { expiresIn: 3600 });
      const responseMarkup = page.markup?.map((line) => {
        return {
          text: line.text,
          x1: line.box.x1,
          y1: line.box.y1,
          x2: line.box.x2,
          y2: line.box.y2
        } as MenuLineResponseModel;
      });
      pages.push({
        pageNumber: page.pageNumber,
        imageUrl: imageUrl,
        markup: responseMarkup
      } as MenuPageResponseModel);
    }

    response.pages = pages;
  }

  return response;
}

export const GET: Operation = [
  async (req: Request, res: Response) => {
    const id = req?.params?.id;

    const query = { _id: new ObjectId(id) };
    const document = await collections.menus?.findOne(query);

    if (!document) {
      res.status(404).send(`Menu with id: ${id} not found`);
      return;
    }

    const { _id, ...menu } = document;
    menu.id = _id.toString();

    const menuResponse = await menuToResponseModel(menu as MenuModel);
    res.status(200).json(menuResponse);
  },
];

GET.apiDoc = {
  description: "Get Menu",
  operationId: "getMenu",
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
  responses: {
    200: {
      description: "Menu",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Menu",
          },
        },
      },
    },
  },
};

