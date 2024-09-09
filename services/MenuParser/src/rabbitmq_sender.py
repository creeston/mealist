from typing import Any
import pika
import json

class RabbitMQSender:
    def __init__(self, host, username, password):
        self.host = host
        self.username = username
        self.password = password

    def send_message(self, message: Any, exchange_name: str, queue_name: str):
        credentials = pika.PlainCredentials(self.username, self.password)
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=self.host, port='5672', virtual_host='/', credentials=credentials))
        channel = connection.channel()
        message = json.dumps(message)
        channel.basic_publish(exchange_name, queue_name, message)
        connection.close()
