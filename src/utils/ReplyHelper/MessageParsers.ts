export function extractText(messageObject: any) {
  let text = '';
  const { message } = messageObject;
  if (message) {
    if (message.text && message.text.body) {
      text = message.text.body;
    } else if (message.interactive && message.interactive.button_reply) {
      text = message.interactive.button_reply.id;
    } else if (message.interactive && message.interactive.list_reply) {
      text = message.interactive.list_reply.id;
    } else if (message.type === 'button' && message.button) {
      text = message.button.text;
    } else if (message.type === 'image' && message.image.caption) {
      text = message.image.caption;
    }
  }
  return text;
}

export interface MessageObject {
  message: {
    from: string;
    id: string;
    timestamp: string;
    type: 'image';
    image: {
      mime_type: string;
      sha256: string;
      id: string;
    };
  };
}

export function extractImageID(messageObject: MessageObject) {
  return messageObject.message.image.id;
}
