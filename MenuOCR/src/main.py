import asyncio
import tempfile
from fastapi import FastAPI
import uvicorn
import json
from aio_pika.abc import AbstractIncomingMessage

from .menu_text_extractor import MenuTextExtractor
from .rabbitmq_listener import RabbitMQListener
from .rabbitmq_sender import RabbitMQSender
from .file_repository import FileRepository

rabbitmq_listener = RabbitMQListener("menu-ocr-queue", "menu-ocr", "menu-ocr")
rabbitmq_sender = RabbitMQSender("host.docker.internal", "menu-ocr", "menu-ocr")
file_repository = FileRepository(
    "http://host.docker.internal:9000", "minioadmin", "minioadmin"
)
text_extractor = MenuTextExtractor()


async def callback(message: AbstractIncomingMessage):
    body = message.body
    print(f"Received message from RabbitMQ: {body}")
    ocr_request = json.loads(body)
    if (
        "menuId" not in ocr_request
        or "menuPage" not in ocr_request
        or "imagePath" not in ocr_request
    ):
        print("Invalid request")
        await message.ack()
        return
    menu_id = ocr_request["menuId"]
    menu_page = ocr_request["menuPage"]
    image_path = ocr_request["imagePath"]
    image_language = ocr_request.get("language", "eng")
    image = file_repository.read_file("mealist", image_path)

    with tempfile.NamedTemporaryFile(delete=False) as temp_image:
        temp_image.write(image)
        temp_image_path = temp_image.name
        data = text_extractor.extract_text(temp_image_path, image_language)

    rabbitmq_sender.send_message(
        {"status": "success", "menuId": menu_id, "menuPage": menu_page, "data": data},
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
