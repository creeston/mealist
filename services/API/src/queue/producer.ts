import { Menu } from '../domain/models/menu';
import { rabbitMQ } from './connection';

export class MessageProducer {
  publishMenuParsingMessage(menu: Menu): void {
    const channel = rabbitMQ.channel!;
    var data = JSON.stringify(menu);
    channel.sendToQueue('menu-parsing-queue', Buffer.from(data));
  }

  publishOcrRequest(menuId: string, menuPage: number, imagePath: string, language: string): void {
    const channel = rabbitMQ.channel!;

    var ocrRequest = JSON.stringify({
      menuId: menuId,
      menuPage: menuPage,
      imagePath: imagePath,
      language: language,
    });
    channel.sendToQueue('menu-ocr-queue', Buffer.from(ocrRequest));
  }
}
