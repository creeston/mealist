
# Set the base image to python3.11

FROM python:3.11

# Download tesseract 

RUN apt-get update && apt-get install -y tesseract-ocr
RUN apt-get install tesseract-ocr-eng  
RUN apt-get install tesseract-ocr-rus 
RUN apt-get install tesseract-ocr-deu  
RUN apt-get install tesseract-ocr-bel  
RUN apt-get install tesseract-ocr-ukr  
RUN apt-get install tesseract-ocr-pol  

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Run main.py when the container launches
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80"]