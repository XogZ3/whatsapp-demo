/* eslint-disable no-console */
// import { v4 as uuidv4 } from 'uuid';

import { setSystemMessage } from '@/utils/ReplyHelper/FirebaseHelpers';

export const x = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '105535119086690',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '971505072100',
              phone_number_id: '115375284757588',
            },
            contacts: [
              {
                profile: {
                  name: 'Gokul Saravanan',
                },
                wa_id: '918754535859',
              },
            ],
            messages: [
              {
                from: '918754535859',
                id: 'wamid.HBgMOTE4NzU0NTM1ODU5FQIAEhgUM0EwRTAzQkU0RDcwRUE5QjU4QzIA',
                timestamp: '1723906242',
                type: 'image',
                image: {
                  mime_type: 'image/jpeg',
                  sha256: 'TUL4BHYVgGobpcJqdsUa6s620z3KLHJ9MrIZy6U5zyM=',
                  id: '808904347896808',
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

// export async function uploadImageToWhatsAppGetURL(
//   base64Content: string,
// ): Promise<string> {
//   const buffer = Buffer.from(base64Content, 'base64');
//   const formData = new FormData();
//   formData.append(
//     'file',
//     new Blob([buffer], { type: 'image/png' }),
//     `${uuidv4()}.png`,
//   );
//   formData.append('type', 'image/png');
//   formData.append('messaging_product', 'whatsapp');

//   const uploadResponse = await fetch(
//     `https://graph.facebook.com/v20.0/${process.env.PHONE_ID}/media`,
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//       },
//       body: formData,
//     },
//   );

//   if (!uploadResponse.ok) {
//     throw new Error(`HTTP error! status: ${uploadResponse.status}`);
//   }

//   const uploadData = await uploadResponse.json();
//   const mediaId = uploadData.id;

//   const mediaUrlResponse = await fetch(
//     `https://graph.facebook.com/v20.0/${mediaId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//       },
//     },
//   );

//   if (!mediaUrlResponse.ok) {
//     throw new Error(`HTTP error! status: ${mediaUrlResponse.status}`);
//   }

//   const mediaUrlData = await mediaUrlResponse.json();
//   return mediaUrlData.url;
// }

export async function getImageURLFromWhatsapp(
  imageID: string,
): Promise<string> {
  const URL = `https://graph.facebook.com/v20.0/${imageID}/`;

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('image url: ', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

export async function makeRequestToWhatsapp(data: any) {
  const URL = `https://graph.facebook.com/v20.0/${process.env.PHONE_ID}/messages?access_token=${process.env.WHATSAPP_TOKEN}`;
  try {
    const ret = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (ret.ok) {
      const responseData = await ret.json();
      return responseData;
    }
    return ret;
  } catch (error) {
    console.log('WHATSAPP SERVICE FAILED', error);
    return error;
  }
}

export interface ICreateMessagePayload {
  phoneNumber: any;
  reaction?: boolean;
  messageID?: string;
  reactionEmoji?: string;
  text?: boolean;
  msgBody?: string;
  msgHeader?: string;
  msgFooter?: string;
  template?: boolean;
  templateName?: string;
  templateLanguageCode?: string;
  image?: boolean;
  imageID?: string;
  imageLink?: string | undefined;
  imageCaption?: string;
  quickReply?: boolean;
  button1?: string | boolean;
  button2?: string | boolean;
  button3?: string | boolean;
  video?: boolean;
  videoLink?: string;
  location?: boolean;
  locationName?: string;
  locationAddress?: string;
  locationLat?: string;
  locationLong?: string;
  pdf?: boolean;
  pdfName?: string;
  pdfLink?: string;
  list?: boolean;
  listButton?: string;
  listTitle1?: string;
  listTitle2?: string;
  listTitle3?: string;
  listTitle4?: string;
  listTitle5?: string;
  listTitle6?: string;
  listTitle7?: string;
  listTitle8?: string;
  listTitle9?: string;
  listTitle10?: string;
  variables?: boolean;
  variable1?: string;
  variable2?: string;
  variable3?: string;
}

type Defined<T> = T extends undefined ? false : T;

export type PropsFormatted = {
  [K in keyof ICreateMessagePayload]: Defined<ICreateMessagePayload[K]>;
};

async function createWAMessagePayload(payload: PropsFormatted) {
  const {
    phoneNumber,
    reaction,
    messageID,
    reactionEmoji,
    text,
    msgBody,
    msgHeader,
    msgFooter,
    template,
    templateName,
    templateLanguageCode,
    image,
    imageID,
    imageLink,
    imageCaption,
    quickReply,
    button1,
    button2,
    button3,
    video,
    videoLink,
    location,
    locationName,
    locationAddress,
    locationLat,
    locationLong,
    pdf,
    pdfName,
    pdfLink,
    list,
    listButton,
    listTitle1,
    listTitle2,
    listTitle3,
    listTitle4,
    listTitle5,
    listTitle6,
    listTitle7,
    listTitle8,
    listTitle9,
    listTitle10,
    variables,
    variable1,
    variable2,
    variable3,
  } = payload;

  const data = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    ...(reaction && {
      type: 'reaction',
      reaction: {
        message_id: messageID,
        emoji: reactionEmoji,
      },
    }),
    ...(text && {
      type: 'text',
      text: {
        preview_url: false,
        body: msgBody,
      },
    }),
    ...(image && {
      type: 'image',
      image: {
        ...(imageLink ? { link: imageLink } : {}),
        ...(imageID ? { id: imageID } : {}),
        ...(imageCaption ? { caption: imageCaption } : {}),
      },
    }),
    ...(pdf && {
      type: 'document',
      document: {
        link: pdfLink,
        filename: pdfName,
      },
    }),
    ...(location && {
      type: 'location',
      location: {
        name: locationName,
        address: locationAddress,
        latitude: locationLat,
        longitude: locationLong,
      },
    }),
    ...(template && {
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLanguageCode,
        },
        components: [
          {
            type: 'header',
            parameters: [
              ...(image
                ? [
                    {
                      type: 'image',
                      image: {
                        link: imageLink,
                      },
                    },
                  ]
                : []),
              ...(video
                ? [
                    {
                      type: 'video',
                      video: {
                        link: videoLink,
                      },
                    },
                  ]
                : []),
            ],
          },
          ...(variables
            ? [
                {
                  type: 'body',
                  parameters: [
                    ...(variable1 ? [{ type: 'text', text: variable1 }] : []),
                    ...(variable2 ? [{ type: 'text', text: variable2 }] : []),
                    ...(variable3 ? [{ type: 'text', text: variable3 }] : []),
                  ],
                },
              ]
            : []),
          ...(quickReply && button1
            ? [
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '0',
                  parameters: [
                    {
                      type: 'payload',
                      payload: 'PAYLOAD',
                    },
                  ],
                },
              ]
            : []),
          ...(quickReply && button2
            ? [
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '1',
                  parameters: [
                    {
                      type: 'payload',
                      payload: 'PAYLOAD',
                    },
                  ],
                },
              ]
            : []),
          ...(quickReply && button3
            ? [
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '2',
                  parameters: [
                    {
                      type: 'payload',
                      payload: 'PAYLOAD',
                    },
                  ],
                },
              ]
            : []),
        ],
      },
    }),
    ...(quickReply &&
      !template && {
        type: 'interactive',
        interactive: {
          type: 'button',
          ...(msgHeader
            ? {
                header: {
                  type: 'text',
                  text: msgHeader,
                },
              }
            : {}),
          body: {
            text: msgBody,
          },
          ...(msgFooter
            ? {
                footer: {
                  text: msgFooter,
                },
              }
            : {}),
          action: {
            buttons: [
              ...(button1
                ? [
                    {
                      type: 'reply',
                      reply: {
                        id: 'button1',
                        title: button1,
                      },
                    },
                  ]
                : []),
              ...(button2
                ? [
                    {
                      type: 'reply',
                      reply: {
                        id: 'button2',
                        title: button2,
                      },
                    },
                  ]
                : []),
              ...(button3
                ? [
                    {
                      type: 'reply',
                      reply: {
                        id: 'button3',
                        title: button3,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
      }),
    ...(list && {
      type: 'interactive',
      interactive: {
        type: 'list',
        ...(msgHeader
          ? {
              header: {
                type: 'text',
                text: msgHeader,
              },
            }
          : {}),
        body: {
          text: msgBody,
        },
        ...(msgFooter
          ? {
              footer: {
                text: msgFooter,
              },
            }
          : {}),
        action: {
          button: listButton,
          sections: [
            {
              rows: [
                ...(listTitle1
                  ? [{ id: 'SECTION_1_ROW_1_ID', title: listTitle1 }]
                  : []),
                ...(listTitle2
                  ? [{ id: 'SECTION_1_ROW_2_ID', title: listTitle2 }]
                  : []),
                ...(listTitle3
                  ? [{ id: 'SECTION_1_ROW_3_ID', title: listTitle3 }]
                  : []),
                ...(listTitle4
                  ? [{ id: 'SECTION_1_ROW_4_ID', title: listTitle4 }]
                  : []),
                ...(listTitle5
                  ? [{ id: 'SECTION_1_ROW_5_ID', title: listTitle5 }]
                  : []),
                ...(listTitle6
                  ? [{ id: 'SECTION_1_ROW_6_ID', title: listTitle6 }]
                  : []),
                ...(listTitle7
                  ? [{ id: 'SECTION_1_ROW_7_ID', title: listTitle7 }]
                  : []),
                ...(listTitle8
                  ? [{ id: 'SECTION_1_ROW_8_ID', title: listTitle8 }]
                  : []),
                ...(listTitle9
                  ? [{ id: 'SECTION_1_ROW_9_ID', title: listTitle9 }]
                  : []),
                ...(listTitle10
                  ? [{ id: 'SECTION_1_ROW_10_ID', title: listTitle10 }]
                  : []),
              ],
            },
          ],
        },
      },
    }),
    ...(!template &&
      !pdf &&
      !location &&
      !list && {
        components: [
          {
            type: 'header',
            parameters: [
              ...(image
                ? [
                    {
                      type: 'image',
                      image: {
                        ...(imageLink ? { link: imageLink } : {}),
                        ...(imageID ? { id: imageID } : {}),
                        ...(imageCaption ? { caption: imageCaption } : {}),
                      },
                    },
                  ]
                : []),
              ...(video
                ? [
                    {
                      type: 'video',
                      video: {
                        link: videoLink,
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
      }),
  };
  return data;
}

export async function sendMessageToWhatsapp(payload: any) {
  const data = await createWAMessagePayload(payload);
  const res = await makeRequestToWhatsapp(data);
  if (res) {
    await setSystemMessage(data);
    return true;
  }
  // if (res?.data?.messages?.length) {
  //   // eslint-disable-next-line no-console
  //   console.log(
  //     `${data.type} outgoing ${res.status === 200 ? 'success' : 'fail'}`,
  //   );
  //   return res && res.status === 200;
  // }
  return false;
}
