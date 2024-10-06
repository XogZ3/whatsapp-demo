import { processTrainingImages } from '@/utils/trainingHelpers';

export async function POST(request: Request) {
  const requestData = await request.text();
  const { clientid, trainingImageURLs } = JSON.parse(requestData);

  if (!trainingImageURLs || !clientid) {
    return new Response(JSON.stringify('Invalid request body'), {
      status: 400,
    });
  }

  try {
    const finalTrainingImageURLs = await processTrainingImages(
      clientid,
      trainingImageURLs,
    );
    // Return success response with Firebase URL
    return new Response(
      JSON.stringify({ message: 'success', urls: finalTrainingImageURLs }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in facecrop or upload:', error);
    return new Response(JSON.stringify(`Error in facecrop api: ${error}`), {
      status: 500,
    });
  }
}
