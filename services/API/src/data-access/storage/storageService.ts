import { CopyObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mealistBucket, mealistPublicBucket, s3config } from '../../config/s3';
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

  async uploadFileToPublicBucket(key: string, body: any): Promise<void> {
    let upload = new Upload({
      client: client,
      params: {
        Bucket: mealistPublicBucket,
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

  async getFileFromPublicBucket(key: string) {
    const command = new GetObjectCommand({
      Bucket: mealistPublicBucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  }

  async copyFileToPublicBucket(sourceKey: string, destinationKey: string) {
    await client.send(
      new CopyObjectCommand({
        Bucket: mealistPublicBucket,
        CopySource: `${mealistBucket}/${sourceKey}`,
        Key: destinationKey,
      })
    );
  }

  getLoadingPlaceholderKey(urlSuffix: string): string {
    return 'QrMenus/' + urlSuffix + '/loadingPlaceholder.png';
  }
}
