import { Operation } from "express-openapi";
import { components } from "../types/api";
import { Response, Request } from "express";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MenuModel } from "../db/models/menu";
import { rabbitMQ } from "../queue/connection";
import { logger } from "../logging/logger";

type MenuResponseModel = components["schemas"]["Menu"];
type CreateMenuRequest = components["schemas"]["CreateMenuRequest"]

let menus: MenuModel[] = [];

const client = new S3Client({
  endpoint: "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  region: "europe-west1"
})

export const listenToMenuParsingStatusQueue = () => {
  if (rabbitMQ.channel) {
    logger.log({
      level: 'info', message: 'Subscribing to menu-parsing-status-queue',
    })
    rabbitMQ.channel.consume("menu-parsing-status-queue", (msg) => {
      logger.log({
        level: 'info', message: 'Received message from menu-parsing-status-queue'
      })

      if (msg) {
        const data = JSON.parse(msg.content.toString());
        const menu = menus.find((menu) => menu.id === data.menuId);
        if (menu) {
          menu.modifiedDate = new Date().toISOString();
          menu.images = data.paths;
          menu.status = "parsed";
        }

        logger.log({
          level: 'info', message: 'Menu updated with image urls'
        });

        rabbitMQ.channel!.ack(msg);
      }
    });
  }
};


export const GET: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const menusReponse: MenuResponseModel[] = await Promise.all(menus.map(async (menu) => {
      const command = new GetObjectCommand({
        Bucket: "mealist",
        Key: menu.menuKey,
      });

      const url = await getSignedUrl(client, command, { expiresIn: 3600 });

      const response = {
        id: menu.id,
        name: menu.name,
        originalFileUrl: url,
        creationDate: menu.creationDate,
        moodifiedDate: menu.modifiedDate,
        status: menu.status
      } as MenuResponseModel;

      if (menu.images && menu.images.length > 0) {
        const imageUrls = [];
        for (let image of menu.images) {
          const getImageCommand = new GetObjectCommand({
            Bucket: "mealist",
            Key: image,
          });

          const imageUrl = await getSignedUrl(client, getImageCommand, { expiresIn: 3600 });
          imageUrls.push(imageUrl);
        }

        response.images = imageUrls;
        response.previewImageUrl = imageUrls[0];
      }

      return response;
    }));
    res.json(menusReponse);
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

    logger.log({
      level: 'info', message: 'Creating new menu'
    })

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No file uploaded" });
    }

    let file = files[0];

    const menu = body as CreateMenuRequest;

    if (files && files.length > 0) {
      const menuId = menus.length + 1;
      const menuName = menu.name ? menu.name : file.originalname;
      const key = "RawMenus/" + menuId + "/" + file.originalname;
      const bucket = "mealist";
      let upload = new Upload({
        client: client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: files[0].buffer,
        },
      });

      await upload.done();

      const newMenu: MenuModel = {
        id: menuId + '',
        name: menuName,
        menuKey: key,
        creationDate: new Date().toISOString(),
        status: "parsing"
      };

      menus.push(newMenu);

      const channel = rabbitMQ.channel;

      if (channel) {
        var data = JSON.stringify(newMenu);
        channel.sendToQueue('menu-parsing-queue', Buffer.from(data));
      }

      res.status(201).json(newMenu);
    }
    else {
      res.status(400).json({ error: "No file uploaded" });
    }
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