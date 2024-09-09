import { Operation } from "express-openapi";
import { components } from "../api";
import { Response, Request } from "express";
import { MenuModel, MenuPageModel } from "../../models/menu";
import { rabbitMQ } from "../../queue/connection";
import { logger } from "../../utils/logging/logger";
import { collections, menusRepository } from "../../repositories/connection";
import { ObjectId } from "mongodb";
import { MenusService } from "../../services/menusService";

type MenuResponseModel = components["schemas"]["Menu"];
type CreateMenuRequest = components["schemas"]["CreateMenuRequest"];

export const menusService = new MenusService(menusRepository);

export const listenToMenuParsingStatusQueue = () => {
  const channel = rabbitMQ.channel;
  if (!channel) {
    logger.log({
      level: "error",
      message: "Channel not found",
    });

    return;
  }

  logger.log({
    level: "info",
    message: "Subscribing to menu-parsing-status-queue",
  });
  channel.consume("menu-parsing-status-queue", async (msg) => {
    logger.log({
      level: "info",
      message: "Received message from menu-parsing-status-queue",
    });

    if (!msg) {
      logger.log({
        level: "error",
        message: "Message not found",
      });
      return;
    }

    const data = JSON.parse(msg.content.toString());

    if (!data.paths) {
      logger.log({
        level: "error",
        message: "Paths not found",
      });
      channel!.ack(msg);
      return;
    }

    const menuId = data.menuId as string;
    const query = { _id: new ObjectId(menuId) };
    const document = await collections.menus!.findOne(query);

    if (!document) {
      logger.log({
        level: "error",
        message: "Menu not found",
      });
      channel!.ack(msg);
      return;
    }

    const { _id, ...rest } = document;
    const menu = rest as MenuModel;

    menu.modifiedDate = new Date().toISOString();
    menu.pages = data.paths.map((path: string, i: number) => {
      return {
        pageNumber: i,
        imagePath: path,
      };
    });
    menu.status = "PARSING_COMPLETED";

    await collections.menus!.updateOne(query, {
      $set: menu,
    });

    logger.log({
      level: "info",
      message: "Menu updated with image urls",
    });

    channel.ack(msg);

    menu.pages!.forEach((page: MenuPageModel) => {
      var ocrRequest = JSON.stringify({
        menuId: menu.id,
        menuPage: page.pageNumber,
        imagePath: page.imagePath,
        language: menu.language,
      });
      channel.sendToQueue("menu-ocr-queue", Buffer.from(ocrRequest));
    });

    logger.log({
      level: "info",
      message: "Sent ocr requests to menu-ocr-queue",
    });

    menu.status = "OCR_IN_PROGRESS";
  });
};

export const listenToMenuOcrStatusQueue = () => {
  const channel = rabbitMQ.channel;
  if (!channel) {
    logger.log({
      level: "error",
      message: "Channel not found",
    });

    return;
  }

  logger.log({
    level: "info",
    message: "Subscribing to menu-ocr-status-queue",
  });

  channel.consume("menu-ocr-status-queue", async (msg) => {
    logger.log({
      level: "info",
      message: "Received message from menu-ocr-status-queue",
    });

    if (!msg) {
      logger.log({
        level: "error",
        message: "Message not found",
      });
      return;
    }

    const content = msg.content.toString();
    logger.log({
      level: "info",
      message: content,
    });

    const data = JSON.parse(content);
    const menuId = data.menuId as string;
    const query = { _id: new ObjectId(menuId) };
    const document = await collections.menus!.findOne(query);

    if (!document) {
      logger.log({
        level: "error",
        message: "Menu not found",
      });
      rabbitMQ.channel!.ack(msg);
      return;
    }

    const { _id, ...rest } = document;
    const menu = rest as MenuModel;
    const pageNumber = data.menuPage;

    if (!menu.pages || pageNumber > document.pages.length) {
      logger.log({
        level: "error",
        message: "Pages not found",
      });
      rabbitMQ.channel!.ack(msg);
      return;
    }

    menu.modifiedDate = new Date().toISOString();
    menu.pages[pageNumber].markup = data.data.map((block: any) => {
      return {
        blockId: block.blockId,
        text: block.text,
        box: block.box,
      };
    });

    if (menu.pages.every((menu) => menu.markup)) {
      menu.status = "OCR_COMPLETED";
    }

    await collections.menus!.updateOne(query, {
      $set: menu,
    });

    logger.log({
      level: "info",
      message: `Menu page ${pageNumber} updated with ocr data`,
    });

    rabbitMQ.channel!.ack(msg);
  });
};

export const GET: Operation = [
  async (req: Request, res: Response): Promise<void> => {
    const menus = await menusService.listMenus();
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

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No file uploaded" });
    }

    let file = files[0];
    const menu = body as CreateMenuRequest;
    await menusService.createMenu(menu, file);

    res.status(201).json({ message: "Menu created" });
  },
];

POST.apiDoc = {
  description: "Create a new menu",
  operationId: "createMenu",
  tags: ["menus"],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
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
