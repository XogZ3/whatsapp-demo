export function extractText(messageObject: any) {
  let text = '';
  const { message } = messageObject;
  if (message) {
    if (message.text && message.text.body) {
      text = message.text.body;
    } else if (message.interactive && message.interactive.button_reply) {
      text = message.interactive.button_reply.title;
    } else if (message.interactive && message.interactive.list_reply) {
      text = message.interactive.list_reply.title;
    } else if (message.type === 'button' && message.button) {
      text = message.button.text;
    }
  }
  return text;
}
