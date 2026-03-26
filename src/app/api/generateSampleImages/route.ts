import { type NextRequest, NextResponse } from 'next/server';

import { generateAndSendModelImages } from '@/utils/sendSampleImages';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { age, gender, loraFilename, clientid, language } = body;

  generateAndSendModelImages({
    age,
    gender,
    loraFilename,
    clientid,
    language,
  });

  return NextResponse.json({ status: 200 });
}
