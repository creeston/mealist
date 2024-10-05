from aio_pika import connect_robust

class RabbitMQListener:
    def __init__(self, queue_name, username, password):
        self.queue_name = queue_name
        self.username = username
        self.password = password

    async def consume(self, callback, loop):
        connection = await connect_robust(host="host.docker.internal", port=5672, login=self.username, password=self.password, virtualhost="/", loop=loop)
        channel = await connection.channel()
        queue = await channel.get_queue(self.queue_name)
        print('Listening to the RabbitMQ queue...')
        await queue.consume(callback, no_ack=False)
        return connection 
