import { Operation } from "express-openapi";
import { components } from "../types/api";
import { Response, Request } from "express";
import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";


type Menu = components["schemas"]["Menu"];
type CreateMenuRequest = components["schemas"]["CreateMenuRequest"]

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

export const POST: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const { body } = req;

    const files = req.files as Express.Multer.File[];

    let client = new S3Client({
      endpoint: "http://127.0.0.1:9000",
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
      region: "europe-west1"
    })

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No file uploaded" });
    }

    let file = files[0];

    const menu = body as CreateMenuRequest;
    const newMenu: Menu = {
      id: menus.length + 1 + '',
      name: menu.name ? menu.name : file.originalname,
    };

    menus.push(newMenu);

    if (files && files.length > 0) {
      let upload = new Upload({
        client: client,
        params: {
          Bucket: "mealist",
          Key: "RawMenus/" + newMenu.id + "/" + newMenu.name,
          Body: files[0].buffer,
        },
      });

      await upload.done();
    }
    res.status(201).json(newMenu);
  },
];


POST.apiDoc = {
  description: "Create a new menu",
  operationId: "createMenu",
  tags: ["menus"],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          $ref: "#/components/schemas/CreateMenuRequest",
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created menu",
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