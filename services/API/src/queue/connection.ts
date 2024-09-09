import amqp from "amqplib/callback_api";

const rabbitConnectionString = "amqp://admin:admin@localhost:5672/";

export const rabbitMQ: { channel?: amqp.Channel } = {};

export async function connectoToRabbitMQ() {
  const promise = new Promise<amqp.Channel>((resolve, reject) => {
    amqp.connect(rabbitConnectionString, function (error, connection) {
      if (error) {
        reject(error)
      }

      connection.createChannel(function (error1, channel) {
        if (error1) {
          reject(error1);
        }

        rabbitMQ.channel = channel;
        resolve(channel);
      });
    });
  });

  await promise;
}