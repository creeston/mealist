from PIL import Image
import pytesseract


class MenuTextExtractor:
    def __init__(self, tesseract_cmd=None):
        """
        Initialize the ImageTextExtractor class.

        :param tesseract_cmd: Optional. The path to the tesseract executable.
                              If Tesseract is in the system PATH, this can be omitted.
        """
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def extract_text(self, image_path):
        """
        Extract text from an image using Tesseract OCR.

        :param image_path: The path to the image file from which to extract text.
        :return: The text extracted from the image.
        """
        try:
            image = Image.open(image_path)
            data = pytesseract.image_to_data(image, output_type="dict")
            values = len(data["text"])
            extracted_texts = []
            for i in range(values):
                text = data["text"][i]
                level = data["level"][i]
                block_num = data["block_num"][i]
                par_num = data["par_num"][i]
                line_num = data["line_num"][i]
                word_num = data["word_num"][i]
                left = data["left"][i]
                top = data["top"][i]
                width = data["width"][i]
                height = data["height"][i]
                conf = data["conf"][i]
                if conf < 50:
                    continue
                extracted_texts.append(
                    {
                        "text": text,
                        "level": level,
                        "block_num": block_num,
                        "par_num": par_num,
                        "line_num": line_num,
                        "word_num": word_num,
                        "left": left,
                        "top": top,
                        "width": width,
                        "height": height,
                        "conf": conf,
                    }
                )
            texts_grouped_by_blocks = {}
            for text in extracted_texts:
                block_num = text["block_num"]
                if block_num not in texts_grouped_by_blocks:
                    texts_grouped_by_blocks[block_num] = []
                texts_grouped_by_blocks[block_num].append(text)
            data = []
            for block, texts in sorted(
                texts_grouped_by_blocks.items(), key=lambda x: x[0]
            ):
                block_text = " ".join([text["text"] for text in texts])
                x1 = min([text["left"] for text in texts])
                x2 = max([text["left"] + text["width"] for text in texts])
                y1 = min([text["top"] for text in texts])
                y2 = max([text["top"] + text["height"] for text in texts])
                data.append(
                    {
                        "block_id": block,
                        "text": block_text,
                        "box": {"x1": x1, "x2": x2, "y1": y1, "y2": y2},
                        "texts": texts,
                    }
                )
            return data

        except Exception as e:
            return f"An error occurred: {e}"


if __name__ == "__main__":
    extractor = MenuTextExtractor()
    import json

    blocks = extractor.extract_text("samples/0.jpeg")
    with open("output.json", "w") as f:
        f.write(json.dumps(blocks, indent=4))
