const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  // Get the IP address from the headers
  const headersList = request.headers;
  const ip =
    headersList.get('x-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip');

  // Return the IP address in a JSON response
  return new Response(JSON.stringify({ ip }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
