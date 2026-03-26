import { getBaseUrl } from './helpers';

export async function sendMessageToTelegram(message: string) {
  const telegramUrl = `${getBaseUrl()}/api/telegram`;
  const res = await fetch(telegramUrl, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    console.error('failed to send telegram msg');
  }
}
