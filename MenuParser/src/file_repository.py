import boto3

class FileRepository:
    def __init__(self, minio_endpoint, minio_access_key, minio_secret_key):
        self.minio_endpoint = minio_endpoint
        self.minio_access_key = minio_access_key
        self.minio_secret_key = minio_secret_key

    def read_file(self, bucket_name, file_name) -> bytes:
        s3_client = boto3.client(
            's3',
            endpoint_url=self.minio_endpoint,
            aws_access_key_id=self.minio_access_key,
            aws_secret_access_key=self.minio_secret_key
        )

        try:
            response = s3_client.get_object(Bucket=bucket_name, Key=file_name)
            file_contents = response['Body'].read()
            return file_contents
        except Exception as e:
            print(f"Error reading file from Minio: {e}")
            return None
        
    def upload_file(self, bucket_name, key: str, file: bytes) -> None:
        s3_client = boto3.client(
            's3',
            endpoint_url=self.minio_endpoint,
            aws_access_key_id=self.minio_access_key,
            aws_secret_access_key=self.minio_secret_key
        )
        try:
            s3_client.put_object(Bucket=bucket_name, Key=key, Body=file)
            print(f"File uploaded successfully to Minio: {key}")
        except Exception as e:
            print(f"Error uploading file to Minio: {e}")
        

if __name__ == "__main__":
    minio_reader = FileRepository('http://localhost:9000', 'minioadmin', 'minioadmin')
    bucket_name = 'test'
    file_name = 'samples/restaurant_menu.pdf'
    with open(file_name, 'rb') as f:
        minio_reader.upload_file(bucket_name, file_name, f.read())
    file_contents = minio_reader.read_file(bucket_name, file_name)
    if file_contents:
        with open('samples/downloaded_file.pdf', 'wb') as f:
            f.write(file_contents)
        
