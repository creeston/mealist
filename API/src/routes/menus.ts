import { Operation } from "express-openapi";
import { components } from "../types/api";
import { Response, Request } from "express";
import { Upload } from "@aws-sdk/lib-storage";
import { MenuModel, MenuPageModel } from "../db/models/menu";
import { rabbitMQ } from "../queue/connection";
import { logger } from "../logging/logger";
import { collections } from "../db/connection";
import { client, menuToResponseModel } from "./menus/{id}";

type MenuResponseModel = components["schemas"]["Menu"];
type CreateMenuRequest = components["schemas"]["CreateMenuRequest"]


export const listenToMenuParsingStatusQueue = () => {
  const channel = rabbitMQ.channel;
  if (!channel) {
    logger.log({
      level: 'error', message: 'Channel not found'
    });

    return;
  }

  logger.log({
    level: 'info', message: 'Subscribing to menu-parsing-status-queue',
  })
  channel.consume("menu-parsing-status-queue", (msg) => {
    logger.log({
      level: 'info', message: 'Received message from menu-parsing-status-queue'
    })

    if (!msg) {
      logger.log({
        level: 'error', message: 'Message not found'
      });
      return;
    }

    const data = JSON.parse(msg.content.toString());
    const menu = collections.menus!.find((menu) => menu.id === data.menuId);

    if (!menu) {
      logger.log({
        level: 'error', message: 'Menu not found'
      });
      channel!.ack(msg);
      return;
    }

    if (!data.paths) {
      logger.log({
        level: 'error', message: 'Paths not found'
      });
      channel!.ack(msg);
      return;
    }

    menu.modifiedDate = new Date().toISOString();
    menu.pages = data.paths.map((path: string, i: number) => {
      return {
        pageNumber: i,
        imagePath: path
      };
    });
    menu.status = "PARSING_COMPLETED";

    logger.log({
      level: 'info', message: 'Menu updated with image urls'
    });

    channel.ack(msg);

    menu.pages!.forEach((page: MenuPageModel) => {
      var ocrRequest = JSON.stringify({
        menuId: menu.id,
        menuPage: page.pageNumber,
        imagePath: page.imagePath
      });
      channel.sendToQueue('menu-ocr-queue', Buffer.from(ocrRequest));
    });

    logger.log({
      level: 'info', message: 'Sent ocr requests to menu-ocr-queue'
    });

    menu.status = "OCR_IN_PROGRESS";
  });
};

export const listenToMenuOcrStatusQueue = () => {
  const channel = rabbitMQ.channel;
  if (!channel) {
    logger.log({
      level: 'error', message: 'Channel not found'
    });

    return;
  }

  logger.log({
    level: 'info', message: 'Subscribing to menu-ocr-status-queue',
  })

  channel.consume("menu-ocr-status-queue", (msg) => {
    logger.log({
      level: 'info', message: 'Received message from menu-ocr-status-queue'
    })

    if (!msg) {
      logger.log({
        level: 'error', message: 'Message not found'
      });
      return;
    }

    const data = JSON.parse(msg.content.toString());
    const menu = collections.menus!.find((menu) => menu.id === data.menuId);
    const pageNumber = data.menuPage;

    if (!menu) {
      logger.log({
        level: 'error', message: 'Menu not found'
      });
      rabbitMQ.channel!.ack(msg);
      return;
    }

    if (!menu.pages || pageNumber > menu.pages.length) {
      logger.log({
        level: 'error', message: 'Pages not found'
      });
      rabbitMQ.channel!.ack(msg);
      return;
    }

    menu.modifiedDate = new Date().toISOString();
    menu.pages[pageNumber].markup = data.data.map((block: any) => {
      return {
        blockId: block.blockId,
        text: block.text,
        box: block.box
      };
    });

    if (menu.pages.every((page) => page.markup)) {
      menu.status = "OCR_COMPLETED";
    }

    logger.log({
      level: 'info', message: `Menu page ${pageNumber} updated with ocr data`
    });

    rabbitMQ.channel!.ack(msg);
  });
}

export const GET: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const menusReponse: MenuResponseModel[] = await Promise.all(collections.menus!.map(async (menu) => {
      const response = await menuToResponseModel(menu);
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
      const menuId = collections.menus!.length + 1;
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
        menuPath: key,
        creationDate: new Date().toISOString(),
        status: "NOT_PARSED",
      };

      collections.menus!.push(newMenu);

      const channel = rabbitMQ.channel;

      if (channel) {
        var data = JSON.stringify(newMenu);
        channel.sendToQueue('menu-parsing-queue', Buffer.from(data));
      }

      logger.log({
        level: 'info', message: 'Menu created and sent to menu-parsing-queue'
      });

      newMenu.status = "PARSING_IN_PROGRESS";

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