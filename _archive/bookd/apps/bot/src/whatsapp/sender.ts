interface SendMessageOptions {
  token: string;
  phoneNumberId: string;
}

interface TextMessage {
  type: "text";
  to: string;
  text: string;
}

interface ButtonMessage {
  type: "buttons";
  to: string;
  text: string;
  buttons: Array<{ id: string; title: string }>;
}

interface ListMessage {
  type: "list";
  to: string;
  text: string;
  buttonText: string;
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

interface LocationMessage {
  type: "location";
  to: string;
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export type OutgoingMessage =
  | TextMessage
  | ButtonMessage
  | ListMessage
  | LocationMessage;

export class WhatsAppSender {
  private token: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor(opts: SendMessageOptions) {
    this.token = opts.token;
    this.phoneNumberId = opts.phoneNumberId;
    this.baseUrl = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
  }

  async send(message: OutgoingMessage): Promise<void> {
    const payload = this.buildPayload(message);
    await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  private buildPayload(message: OutgoingMessage): Record<string, unknown> {
    const base = { messaging_product: "whatsapp", recipient_type: "individual", to: message.to };

    switch (message.type) {
      case "text":
        return { ...base, type: "text", text: { preview_url: false, body: message.text } };

      case "buttons":
        return {
          ...base,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: message.text },
            action: {
              buttons: message.buttons.map((b) => ({
                type: "reply",
                reply: { id: b.id, title: b.title },
              })),
            },
          },
        };

      case "list":
        return {
          ...base,
          type: "interactive",
          interactive: {
            type: "list",
            body: { text: message.text },
            action: {
              button: message.buttonText,
              sections: message.sections,
            },
          },
        };

      case "location":
        return {
          ...base,
          type: "location",
          location: {
            latitude: message.latitude,
            longitude: message.longitude,
            name: message.name,
            address: message.address,
          },
        };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: Array<Record<string, unknown>>
  ): Promise<void> {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components ? { components } : {}),
      },
    };

    await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}
