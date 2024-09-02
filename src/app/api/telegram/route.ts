const { TELEGRAM_BOT_TOKEN } = process.env;
const { TELEGRAM_GROUP_ID } = process.env;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: Request) {
  const requestData = await request.text();
  const { message } = JSON.parse(requestData);

  if (!message) {
    return new Response(JSON.stringify('Invalid request body'), {
      status: 400,
    });
  }

  const body = JSON.stringify({
    chat_id: TELEGRAM_GROUP_ID,
    text: message,
  });

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    return new Response(JSON.stringify('success'), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error in telegram api:', error);
    return new Response(JSON.stringify(`Error in telegram api: ${error}`), {
      status: 404,
    });
  }
}
