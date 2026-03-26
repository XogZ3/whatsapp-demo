import { promises as fs } from 'fs';
import facecrop from 'opencv-facecrop';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import firebase from '@/modules/firebase';

import { getBaseUrl } from './helpers';
import {
  getUserFields,
  uploadImageFileToFirebaseWithRetry,
} from './ReplyHelper/FirebaseHelpers';

const firestore = firebase.getFirestore();

// Function to crop a face and return base64 image
async function cropFace(
  url: string,
  format: string = 'image/jpeg',
  scale: number = 1,
  padding: number = 2.5,
): Promise<string> {
  const outputPath = path.resolve(process.cwd(), `facecrop_${uuidv4()}.jpg`);

  return new Promise((resolve, reject) => {
    try {
      // Perform face cropping
      facecrop(url, outputPath, format, scale, padding);

      const checkFileExists = async () => {
        try {
          await fs.access(outputPath);
          console.log('File created successfully');

          // Read the file as a buffer once it's created
          const imageBuffer = await fs.readFile(outputPath);

          // Convert the image buffer to base64
          const base64Image = imageBuffer.toString('base64');

          // Clean up the temp file after processing
          await fs.unlink(outputPath);

          // Resolve the promise with the base64 image string
          resolve(base64Image);
        } catch (error) {
          console.log('File not created yet, checking again in 100ms');
          setTimeout(checkFileExists, 100);
        }
      };

      // Check if the output file is ready
      checkFileExists();
    } catch (error) {
      reject(error);
    }
  });
}

// Simulate saving to Firebase (this should be replaced with actual Firebase logic)
async function saveToFirebaseGetURL(clientid: string, base64Image: string) {
  const fileType = 'jpeg';
  const foldername = 'training_images';
  const filename = `photograph_of_person${clientid}_${uuidv4()}.${fileType}`;

  const longExpiryURL = await uploadImageFileToFirebaseWithRetry(
    base64Image,
    clientid,
    foldername,
    filename,
  );
  return longExpiryURL;
}

// Function to process training images
export async function cropFaceTrainingImages(
  clientid: string,
  trainingImageURLs: string[],
) {
  try {
    // Process all URLs in parallel using Promise.all
    const croppedImages = await Promise.all(
      trainingImageURLs.map(async (url) => {
        try {
          // Crop face and convert to base64
          const base64Image = await cropFace(url);

          // Save cropped image to Firebase (replace with real implementation)
          const firebaseUrl = await saveToFirebaseGetURL(clientid, base64Image);

          return firebaseUrl; // Return the Firebase URL or base64
        } catch (error) {
          console.error(`Error cropping image at ${url}:`, error);
          return null; // Handle error, returning null if a crop fails
        }
      }),
    );

    // Filter out any failed crops (null values)
    return croppedImages.filter((url): url is string => url !== null);
  } catch (error) {
    console.error('Error processing training images:', error);
    throw error;
  }
}

// Utility function to shuffle an array and return a subset
function getRandomSubset(array: string[], size: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

// Main function to process training images based on the client input
export async function processTrainingImages(
  clientid: string,
  trainingImageURLs: string[],
): Promise<string[]> {
  // Determine how many images we can process (at most 5)
  const numToProcess = Math.min(5, trainingImageURLs.length);

  // Randomly select `numToProcess` URLs for processing
  const urlsToProcess = getRandomSubset(trainingImageURLs, numToProcess);

  // Get the remaining unprocessed URLs
  const unprocessedURLs = trainingImageURLs.filter(
    (url) => !urlsToProcess.includes(url),
  );

  try {
    // Run the face cropping on the selected URLs
    let processedURLs = await cropFaceTrainingImages(clientid, urlsToProcess);

    // Filter out any null values from the result
    processedURLs = processedURLs.filter((url): url is string => Boolean(url));

    // If processing fails or counts don't match, fallback to original trainingImageURLs
    if (processedURLs.length !== numToProcess) {
      console.error(
        `Mismatch in processed count, expected ${numToProcess} but got ${processedURLs.length}`,
      );
      return trainingImageURLs; // Fallback
    }

    // Combine processed and unprocessed URLs
    const finalTrainingImageURLs = [...processedURLs, ...unprocessedURLs];

    // Save finalTrainingImageURLs in Firebase
    const wabaId = process.env.WABA_ID;
    const clientDoc = firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .doc(clientid);

    await clientDoc.update({
      finalTrainingImageURLs,
    });

    console.log('Successfully processed and saved all training images.');
    return finalTrainingImageURLs; // Return the final training URLs
  } catch (error) {
    console.error(
      'Error during image processing or saving to Firebase:',
      error,
    );
    return trainingImageURLs; // Fallback to the original URLs in case of error
  }
}

export async function updateTrainingStatus(
  token: string,
  clientid: string,
  loraURL: string,
  loraFilename: string,
) {
  // Guarding this to prevent duplicate calls b/w n8n and user triggered updates
  const { state } = await getUserFields(clientid);
  const stateObj = JSON.parse(state);
  const currentState = stateObj.value;
  if (currentState !== 'generatingModel') {
    console.log(
      '[O] User is not in generatingModel state anymore. Not updating training status.',
    );
    return;
  }

  const response = await fetch(`${getBaseUrl()}/api/training`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientid,
      loraURL,
      loraFilename: `${loraFilename}.safetensors`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update training status: ${response.statusText}`);
  }
}
