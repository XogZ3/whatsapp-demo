import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import * as fbq from '@/libs/fpixel';

import { getBaseUrl } from './helpers';

export async function findUserIpAddress() {
  try {
    const response = await fetch('/api/get-ip-address');
    if (!response.ok) {
      throw new Error('Failed to fetch IP address');
    }

    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
}

const createPurchaseEventData = async (clientid: string, eventId: string) => {
  const userIp = await findUserIpAddress();

  const hashedClientId = crypto
    .createHash('sha256')
    .update(clientid)
    .digest('base64');

  const purchaseEventData = {
    event_name: 'Purchase',
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: `${getBaseUrl()}/success/${clientid}`,
    user_data: {
      ph: [hashedClientId],
      client_user_agent: navigator.userAgent,
      client_ip_address: userIp || '0.0.0.0',
    },
    custom_data: {
      currency: 'USD',
      // TODO: Make this dynamic by calling stripe price id
      value: 9.99,
    },
  };

  return purchaseEventData;
};

export async function sendPurchaseToFBCoversionAPI(clientid: string) {
  const eventId: string = uuidv4();
  const purchaseEventData = await createPurchaseEventData(clientid, eventId);

  fbq.event('Purchase', { eventID: eventId });

  fetch(
    `https://graph.facebook.com/v20.0/${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}/events?access_token=${process.env.FACEBOOK_CONVERSIONS_API_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [purchaseEventData],
        // FIXME: Remove for production
        test_event_code: 'TEST52360',
      }),
    },
  )
    .then((response) => response.json())
    .then((data) => console.log('fbq data', data))
    .catch((error) => console.error('Error in conversions API: ', error));
}
