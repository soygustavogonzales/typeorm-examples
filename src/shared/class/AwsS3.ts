import * as AWS from 'aws-sdk';

export class AwsS3 {

  private S3: AWS.S3;
  private AWS_S3_BUCKET_NAME : string;

  constructor(s3: AWS.S3, bucketName: string) {
    this.S3 = s3;
    this.AWS_S3_BUCKET_NAME = bucketName;
  }

  uploadFile(buffer: Buffer, fileName: string, ContentType: string, expiresFile: number, logger: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
        await this.S3.putObject(
            {
                Bucket: this.AWS_S3_BUCKET_NAME,
                Body: buffer,
                Key: `reports/${fileName}`,
                ContentType: ContentType
            },
            async (err: AWS.AWSError, data: AWS.S3.PutObjectOutput) => {
                if (err) {
                    logger.error(`CATCH Error upload file on AWS: ${err}`);  
                    return reject(err);  
                } else {
                    const params = { Bucket: this.AWS_S3_BUCKET_NAME, Key: `reports/${fileName}`, Expires: expiresFile }; // 10 min
                    const url = await this.S3.getSignedUrl('getObject', params);
                    logger.debug(`Generate File and upload on S3, url: ${url}`, 'uploadFile:end');
                    return resolve(url);
                }
            }
        );
    });
}



}