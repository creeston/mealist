import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mealistBucket, s3config } from '../../config/s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const client = new S3Client(s3config);

export class StorageService {
  async uploadFile(key: string, body: any): Promise<void> {
    let upload = new Upload({
      client: client,
      params: {
        Bucket: mealistBucket,
        Key: key,
        Body: body,
      },
    });

    await upload.done();
  }

  async getFileUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: mealistBucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  }
}
