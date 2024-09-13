import { rabbitMQ } from './connection';
import { logError, logInfo } from '../utils/logging/logger';

export class MessageConsumer {
  static consumerMenuParsingMessage(callback: (data: any) => Promise<void>) {
    const channel = rabbitMQ.channel!;

    logInfo('Subscribing to menu-parsing-status-queue');

    channel.consume('menu-parsing-status-queue', async (msg) => {
      logInfo('Received message from menu-parsing-status-queue');

      if (!msg) {
        logError('Message not found');
        return;
      }

      const data = JSON.parse(msg.content.toString());

      await callback(data);
      channel.ack(msg);
    });
  }

  static consumeOcrStatusQueue(callback: (data: any) => Promise<void>) {
    const channel = rabbitMQ.channel!;
    logInfo('Subscribing to menu-ocr-status-queue');
    channel.consume('menu-ocr-status-queue', async (msg) => {
      logInfo('Received message from menu-ocr-status-queue');

      if (!msg) {
        logError('Message not found');
        return;
      }

      const data = JSON.parse(msg.content.toString());

      await callback(data);
      channel.ack(msg);
    });
  }
}
