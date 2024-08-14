import asyncio
import uuid
from fastapi import FastAPI
import uvicorn
import json
from aio_pika.abc import AbstractIncomingMessage

from .file_repository import FileRepository
from .pdf_parser import PDFParser
from .rabbitmq_listener import RabbitMQListener
from .rabbitmq_sender import RabbitMQSender


rabbitmq_listener = RabbitMQListener("menu-parsing-queue", "menu-parser", "menu-parser")
rabbitmq_sender = RabbitMQSender("host.docker.internal", "menu-parser", "menu-parser")
file_repository = FileRepository(
    "http://host.docker.internal:9000", "minioadmin", "minioadmin"
)
pdf_parser = PDFParser()


async def callback(message: AbstractIncomingMessage):
    body = message.body
    print(f"Received message from RabbitMQ: {body}")
    menu = json.loads(body)
    file_path = menu["menuPath"]
    menu_id = menu["id"]

    pdf_file = file_repository.read_file("mealist", file_path)
    parsed_data = pdf_parser.parse_pdf(pdf_file)

    files_paths = []
    for i, image in enumerate(parsed_data):
        path = f"ParsedMenu/{menu_id}/{i}.jpeg"
        file_repository.upload_file("mealist", path, image)
        files_paths.append(path)

    message_id = str(uuid.uuid4())
    rabbitmq_sender.send_message(
        {"status": "success", "menuId": menu_id, "paths": files_paths},
        "menu-parsing-status-exchange",
        "menu-parsing-status-queue",
    )
    print(f"Message sent to RabbitMQ: {message_id}")
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
