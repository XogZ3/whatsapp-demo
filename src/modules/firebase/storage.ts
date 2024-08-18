import type { Bucket } from '@google-cloud/storage';

let gBucket: Bucket | null = null;

async function init(storage: any) {
  if (!gBucket) {
    gBucket = storage.bucket();
  }
}

function uploadFile(
  fileStream: NodeJS.ReadableStream,
  filePath: string,
  contentType: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!gBucket) {
      reject(new Error('Storage bucket not initialized'));
      return;
    }

    const fileUploadStream = gBucket.file(filePath).createWriteStream({
      metadata: { contentType },
    });

    fileUploadStream.on('error', (error: any) => {
      console.error('Error uploading file:', error);
      reject(error);
    });

    fileUploadStream.on('finish', async () => {
      console.log('File uploaded successfully.');
      await gBucket?.file(filePath);
      resolve(`https://storage.googleapis.com/${gBucket?.name}/${filePath}`);
    });

    fileStream.pipe(fileUploadStream);
  });
}

const storageModule = {
  init,
  uploadFile,
};

export default storageModule;
