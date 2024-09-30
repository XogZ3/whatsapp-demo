import { getEligibleClientidArray } from '@/utils/ReplyHelper/FirebaseHelpers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  const eligibleClientidArray = await getEligibleClientidArray();
  return new Response(JSON.stringify(eligibleClientidArray), {
    status: 200,
    headers: corsHeaders,
  });
}
