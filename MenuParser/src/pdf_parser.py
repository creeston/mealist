import io
from pdf2image import convert_from_bytes
from PIL.Image import Image


class PDFParser:
    def parse_pdf(self, pdf_file: bytes) -> list[Image]:
        images = convert_from_bytes(pdf_file)
        images_bytes = []
        for image in images:
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            images_bytes.append(img_byte_arr)
        return images_bytes


if __name__ == "__main__":
    pdf_parser = PDFParser()
    pdf_file = "samples/restaurant_menu.pdf"
    with open(pdf_file, "rb") as f:
        images = pdf_parser.parse_pdf(f.read())
    for i, image in enumerate(images):
        with open(f"{pdf_file}_{i}.jpeg", "wb") as f:
            f.write(image)