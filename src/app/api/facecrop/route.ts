import { readFileSync, unlinkSync } from 'fs';
import facecrop from 'opencv-facecrop';
import { promisify } from 'util';

import { uploadImageFileToFirebaseWithRetry } from '@/utils/ReplyHelper/FirebaseHelpers';

const unlinkFile = promisify(unlinkSync);

export async function POST(request: Request) {
  const requestData = await request.text();
  const { url, clientid, foldername, filename } = JSON.parse(requestData);

  if (!url) {
    return new Response(JSON.stringify('Invalid request body'), {
      status: 400,
    });
  }

  try {
    // Use facecrop and save the image temporarily
    const outputPath = './temp/output.jpg';
    facecrop(url, outputPath, 'image/jpeg', 0.95, 1.5);

    // Read the file as a buffer
    const imageBuffer = readFileSync(outputPath);

    // Convert the buffer to base64
    const base64Content = imageBuffer.toString('base64');

    // Upload the base64 image to Firebase
    const firebaseUrl = await uploadImageFileToFirebaseWithRetry(
      base64Content,
      clientid,
      foldername,
      filename,
    );

    // Clean up the temp file
    await unlinkFile(outputPath);

    // Return success response with Firebase URL
    return new Response(JSON.stringify({ message: 'success', firebaseUrl }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error in facecrop or upload:', error);
    return new Response(JSON.stringify(`Error in facecrop api: ${error}`), {
      status: 500,
    });
  }
}
