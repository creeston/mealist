# My Python App

This is a Python application that listens to a RabbitMQ queue, parses a PDF file from Minio storage, saves the parsed information to a file, and sends a response to another RabbitMQ topic.

## Project Structure

```
my-python-app
├── src
│   ├── main.py
│   ├── rabbitmq_listener.py
│   ├── pdf_parser.py
│   ├── minio_reader.py
│   ├── file_saver.py
│   └── rabbitmq_sender.py
├── tests
│   ├── test_rabbitmq_listener.py
│   ├── test_pdf_parser.py
│   ├── test_minio_reader.py
│   ├── test_file_saver.py
│   └── test_rabbitmq_sender.py
├── requirements.txt
└── README.md
```

## Files

### `src/main.py`

This file is the entry point of the application. It initializes the RabbitMQ listener, PDF parser, Minio reader, file saver, and RabbitMQ sender. It starts the application and listens to the RabbitMQ queue.

### `src/rabbitmq_listener.py`

This file exports a class `RabbitMQListener` which connects to the RabbitMQ server, creates a queue, and listens for messages. It has a method `start_listening` that starts the listening process.

### `src/pdf_parser.py`

This file exports a class `PDFParser` which takes a PDF file as input, parses it, and extracts the necessary information. It has a method `parse_pdf` that performs the parsing.

### `src/minio_reader.py`

This file exports a class `MinioReader` which connects to the Minio storage, retrieves the PDF file, and returns its contents. It has a method `read_file` that reads the file from the Minio storage.

### `src/file_saver.py`

This file exports a class `FileSaver` which takes the parsed information and saves it to a file. It has a method `save_file` that saves the file.

### `src/rabbitmq_sender.py`

This file exports a class `RabbitMQSender` which connects to the RabbitMQ server, creates a topic, and sends the parsed information to the topic. It has a method `send_message` that sends the message.

### `tests/test_rabbitmq_listener.py`

This file contains unit tests for the `RabbitMQListener` class.

### `tests/test_pdf_parser.py`

This file contains unit tests for the `PDFParser` class.

### `tests/test_minio_reader.py`

This file contains unit tests for the `MinioReader` class.

### `tests/test_file_saver.py`

This file contains unit tests for the `FileSaver` class.

### `tests/test_rabbitmq_sender.py`

This file contains unit tests for the `RabbitMQSender` class.

### `requirements.txt`

This file lists the dependencies required for the project.

## Usage

1. Install the dependencies listed in `requirements.txt`.
2. Configure the RabbitMQ server and Minio storage connection settings in the respective files.
3. Run `src/main.py` to start the application and listen to the RabbitMQ queue.

## Testing

To run the unit tests, execute the following command:

```bash
python -m unittest discover tests
```

## License

This project is licensed under the [MIT License](LICENSE).