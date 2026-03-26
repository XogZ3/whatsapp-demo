import { Readable } from 'stream';

import { getFirestoreInstance, getStorageInstance } from './firebase';

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// async function compressImage(inputBuffer: Buffer): Promise<Buffer> {
//   return sharp(inputBuffer)
//     .resize({ width: 800 })
//     .webp({ quality: 80 })
//     .toBuffer();
// }

async function uploadImageBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();
  const file = bucket.file(`images/${fileName}`);

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        file.createWriteStream({
          metadata: { contentType: 'image/webp' },
          public: true,
        }),
      )
      .on('error', reject)
      .on('finish', async () => {
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        resolve(publicUrl);
      });
  });
}

async function processImage(
  docId: string,
  url: string,
  index: number,
): Promise<string> {
  try {
    const imageBuffer = await downloadImage(url);
    // const compressedBuffer = await compressImage(imageBuffer);
    const fileName = `${docId}_${index}.webp`;
    return await uploadImageBuffer(imageBuffer, fileName);
  } catch (error) {
    console.error(`Error processing image ${url}:`, error);
    throw error;
  }
}

export async function uploadImagesAndUpdateFirestore(
  collectionName: string,
  docId: string,
): Promise<void> {
  const firestore = getFirestoreInstance();
  const docRef = firestore.collection(collectionName).doc(docId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error(
      `Document ${docId} not found in collection ${collectionName}`,
    );
  }

  const data = doc.data();
  const whatsappImageUrls = data?.whatsappImageUrls || [];

  if (whatsappImageUrls.length === 0) {
    console.log(`No images to process for document ${docId}`);
    return;
  }

  const firebaseImageUrls = await Promise.all(
    whatsappImageUrls.map((url: string, index: any) =>
      processImage(docId, url, index),
    ),
  );

  await docRef.update({ firebaseImageUrls });
  console.log(
    `Updated document ${docId} with ${firebaseImageUrls.length} Firebase Storage URLs.`,
  );
}
