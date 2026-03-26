function removeEnclosingQuotes(text: string): string {
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
}

export function extractText(messageObject: any): string {
  if (!messageObject || typeof messageObject !== 'object') {
    return '';
  }

  const { message } = messageObject;

  if (!message) {
    return '';
  }

  let extractedText = '';

  // Handle text messages
  if (message.text && typeof message.text.body === 'string') {
    extractedText = message.text.body;
  }
  // Handle interactive messages
  else if (message.interactive) {
    if (
      message.interactive.button_reply &&
      message.interactive.button_reply.id
    ) {
      extractedText = message.interactive.button_reply.id;
    } else if (
      message.interactive.list_reply &&
      message.interactive.list_reply.id
    ) {
      extractedText = message.interactive.list_reply.id;
    }
  }
  // Handle button messages
  else if (
    message.type === 'button' &&
    message.button &&
    message.button.payload
  ) {
    extractedText = message.button.payload;
  }
  // Handle image messages with captions
  else if (message.type === 'image' && message.image && message.image.caption) {
    extractedText = message.image.caption;
  }

  return removeEnclosingQuotes(extractedText.trim());
}

export function isContextImageMessage(messageObject: any) {
  const { message } = messageObject;
  if (
    message &&
    message.context &&
    message.context.id &&
    message.type === 'text'
  )
    return true;
  return false;
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
