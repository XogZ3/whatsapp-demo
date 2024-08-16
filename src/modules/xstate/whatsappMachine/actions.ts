import { assign } from 'xstate';

import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';

import type { IMachineConfig, IWhatsappInstance } from './types';

async function sendMessage(
  whatsappInstance: IWhatsappInstance,
  message: string,
  phonenumber: string,
) {
  const payload: ICreateMessagePayload = {
    phoneNumber: phonenumber,
    text: true,
    msgBody: message,
  };

  await whatsappInstance.send(payload);
}

export const actionsFactory = (config: IMachineConfig): any => {
  return {
    assignIdleValues: assign({
      message: () => '',
      processing: () => false,
    }),
    notifyPendingPhotos: assign({
      message: (context: any) =>
        `Send ${15 - context.photosUploaded} more photo(s)`,
    }),
    incrementPhotoCount: assign({
      photosUploaded: (context: any) => context.photosUploaded + 1,
    }),
    generateModel: assign({
      processing: () => true,
      message: () => 'Generating model...',
    }),
    // sendSamplePhotos: assign({
    //   message: () => 'Your model is ready. Here are some sample photos!',
    // }),
    processPayment: assign({
      processing: () => true,
      message: () => 'Processing your payment...',
    }),
    enablePhotoPrompting: assign({
      userPaid: () => true,
      message: () => 'You can now prompt for your own photos!',
    }),
    generatePromptedPhoto: assign({
      remainingCredits: (context: any) => context.remainingCredits - 1,
      message: () => 'Generating your prompted photo...',
    }),
    sendInvalidInputMessage: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.";
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendIntroOptionsMessage: async () => {
      const message = `HELLOOOO 🙋‍♂️`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Upload Photos',
        button2: 'Pricing',
        button3: 'Tutorial',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendGreeting: async () => {
      const message = `HELLOOOO 🙋‍♂️`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'FAQ',
        button2: 'Pricing',
        button3: 'Tutorial',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendFAQ: async () => {
      const message = `🙋‍♂️🙋‍♂️🙋‍♂️🙋‍♂️🙋‍♂️`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Admin Video',
        button2: 'Member Video',
        button3: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPricing: async () => {
      const message = `1 unicorn`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Buy Credits',
        button2: 'Tutorial',
        button3: 'Main Menu',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendTutorial: async () => {
      const message = `Here's the tutorial...`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Upload Photos',
        button2: 'Pricing',
        button3: 'Main Menu',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPhotoUploadInstruction: async () => {
      const message = `Send 10-15 photos...`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendGeneratingModel: async () => {
      const message =
        "Generating model.. Will send message once it's ready. It may take 20-30 minutes.";
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendModelGeneratedSuccess: async () => {
      const message = 'Your model has been successfully generated! :D';
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendSamplePhotos: async () => {
      const message = 'Here you go, some sample photos, some blurred..';
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendPaymentInstructions: async () => {
      const message = 'STRIPE link..';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaymentConfirmation: async () => {
      const message = 'Payment success.. you have xxx credits';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaidUserOptions: async () => {
      const message = 'Whatcha wanna see your ai self do?';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Create Photo',
        button2: 'Cancel',
        button3: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPromptingInstruction: async () => {
      const message = 'Send your prompt';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendCredits: () => {
      // Logic to send remaining credits
    },
  };
};
