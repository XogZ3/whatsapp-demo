import { getBaseUrl } from './helpers';
import { getUserFields } from './ReplyHelper/FirebaseHelpers';

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
