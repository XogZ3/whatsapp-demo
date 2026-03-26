import axios from 'axios';
import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';

// import * as fbq from '@/libs/fpixel';
import { getBaseUrl } from './helpers';

export async function findUserIpAddress() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/getUserIp`);
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
  const hashedClientId = sha256(clientid);

  const purchaseEventData = {
    event_name: 'Purchase',
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'other',
    user_data: {
      ph: [hashedClientId],
    },
    custom_data: {
      currency: 'USD',
      // TODO: Make this dynamic by calling stripe price id
      value: '9.99',
    },
  };

  return purchaseEventData;
};

export async function sendPurchaseToFBCoversionAPI(clientid: string) {
  const eventId: string = uuidv4();
  const purchaseEventData = await createPurchaseEventData(clientid, eventId);

  // fbq.event('Purchase', { eventID: eventId });

  try {
    const facebookURL = `https://graph.facebook.com/v20.0/${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}/events?access_token=${process.env.FACEBOOK_CONVERSIONS_API_ACCESS_TOKEN}`;
    console.log('[O] Attempting to send fb conversion: ', facebookURL);

    const response = await axios.post(
      facebookURL,
      {
        data: [purchaseEventData],
        // FIXME: Remove for production
        test_event_code: 'TEST36365',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('fbq data', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('[!] Error sending event to conversion API', error);
  }
}
