import asyncio
import tempfile
from fastapi import FastAPI
import uvicorn
import json
from aio_pika.abc import AbstractIncomingMessage

from src.menu_text_extractor import MenuTextExtractor
from src.rabbitmq_listener import RabbitMQListener
from src.rabbitmq_sender import RabbitMQSender
from src.file_repository import FileRepository

rabbitmq_listener = RabbitMQListener("menu-ocr-queue", "menu-ocr", "menu-ocr")
rabbitmq_sender = RabbitMQSender("host.docker.internal", "menu-ocr", "menu-ocr")
file_repository = FileRepository("http://host.docker.internal:9000", "minioadmin", "minioadmin")
text_extractor = MenuTextExtractor()


async def callback(message: AbstractIncomingMessage):
    body = message.body
    print(f"Received message from RabbitMQ: {body}")
    ocr_request = json.loads(body)
    menu_id = ocr_request["menu_id"]
    image_path = ocr_request["image_path"]
    image_page = ocr_request["image_page"]

    image = file_repository.read_file("mealist", image_path)

    with tempfile.NamedTemporaryFile(delete=False) as temp_image:
        temp_image.write(image)
        temp_image_path = temp_image.name
        data = text_extractor.extract_text(temp_image_path)

    rabbitmq_sender.send_message(
        {"status": "success", "menuId": menu_id, "imagePage": image_page, "imagePath": image_path, "data": data},
        "menu-ocr-status-exchange",
        "menu-ocr-status-queue",
    )
    print("Message sent to RabbitMQ")
    await message.ack()


async def lifespan(_: FastAPI):
    loop = asyncio.get_running_loop()
    task = loop.create_task(rabbitmq_listener.consume(callback, loop))
    await task

    yield


app = FastAPI(lifespan=lifespan)


@app.get("/healthcheck")
async def healthcheck():
    return {"status": "OK"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
