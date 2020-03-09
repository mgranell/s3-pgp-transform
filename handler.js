// eslint-disable-next-line import/no-extraneous-dependencies
import 'source-map-support/register';
// eslint-disable-next-line import/no-extraneous-dependencies
import { S3 } from 'aws-sdk';
import S3ReadableStream from 's3-readable-stream';
import { encryptStream, decryptStream } from './pgpencryption';

async function handleS3event(event, fileCondition, targetNameFunc, conversionFunc) {
  const s3bucket = event.Records[0].s3.bucket.name;
  const s3key = event.Records[0].s3.object.key.replace(/\+/g, ' ').replace(/%2B/g, '+');

  if (!fileCondition(s3key)) { // don't try to encrypt files that are already encrypted
    console.log(`Ignoring file: ${s3key}`);
    return null;
  }

  console.log(`Processing file: ${s3key}`);

  // Check for pre-existing target file with later date
  const s3 = new S3({
    httpOptions: {
      timeout: 900000, // 15 minutes
    },
  });

  const targetFileName = targetNameFunc(s3key);
  const targetModifiedDate = await s3.headObject({ Bucket: s3bucket, Key: targetFileName })
    .promise()
    .then((head) => head.LastModified)
    .catch((err) => {
      if (err.statusCode === 404) {
        return undefined;
      }
      return Promise.reject(err);
    });

  if (targetModifiedDate) {
    const sourceModifiedDate = (await s3.headObject({ Bucket: s3bucket, Key: s3key })
      .promise())
      .LastModified;

    if (targetModifiedDate > sourceModifiedDate) {
      console.log(`Newer target file ${targetFileName} already exists.`);
      return null;
    }
  }

  //const inputStream = s3.getObject({ Bucket: s3bucket, Key: s3key }).createReadStream();
  const inputStream = new S3ReadableStream(s3, { Bucket: s3bucket, Key: s3key }, { chunkSize: 8 * 1024 * 1024 });
  const outputStream = await conversionFunc(inputStream);

  await s3.upload({
    Body: outputStream,
    Bucket: s3bucket,
    Key: targetFileName,
  }).promise();

  return {
    bucket: s3bucket,
    sourceFile: s3key,
    targetFile: targetFileName,
  };
}


export async function s3encrypt(event) {
  const result = await handleS3event(event, (key) => !key.endsWith('.pgp'), (key) => `${key}.pgp`, encryptStream);
  if (!result) {
    return;
  }

  console.log(`Encrypted ${result.bucket}/${result.sourceFile} to produce ${result.bucket}/${result.targetFile}`);
}

export async function s3decrypt(event) {
  const result = await handleS3event(event, (key) => key.endsWith('.pgp') || key.endsWith('.gpg'), (key) => key.substr(0, key.length - 4), decryptStream);
  if (!result) {
    return;
  }

  console.log(`Decrypted ${result.bucket}/${result.sourceFile} to produce ${result.bucket}/${result.targetFile}`);
}

export async function checkconfig(event) {
  const s3bucket = event.Records[0].s3.bucket.name;
  const s3key = event.Records[0].s3.object.key.replace(/\+/g, ' ').replace(/%2B/g, '+');
  console.log(`File ${s3bucket}/${s3key} updated.`);
}
