// machine.ts

import { assign, createMachine } from 'xstate';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6JtAZgCMAOlHbRtgOymzmgBwA2MwFYAvl-1osOPhEpJRgFsoAQjLoAE4QlFB0AAoAMiwAggAinEkAEiwAKiy8YpJIILLyisqqGgjOzpoWdia2mmYAnK4doiaadvpGCCaudhZOHWZ2DZqirh7ampo+fhjYeIQk5FThFFGx8RSJSQBK3ADC3PQA4qWqlQpKKuV1rq5NLq7adh02zgumQbGbSuCzOUR2DyiTQjSEdEYrED+dZBLahXb7OIJagFWhFM7pFJ3coParPUCvL7NebQqYmEFmVxAhBmcwWbQ2WzmcxmXqmRHIwKbEI7SLRLFHagEdJXTgEQT0WjE6RyR41F6IN6WEy-DytEF2MxmZx6QyIZyWSaaDodaYeXnvPUCtZC4LbMJkAC26BgsG4FGIMk9uAANmBMDQ8oUWJwToJzoJuAA1QSZZUVVVk2qII0dZwWeaQ1wmDw2xrmZkjDrNEyQo3fKF9Za+JEujZu9Fen1wf2B4NhiPUKNFWPxxMptNmMoqqpPbP1Ro1tqdbq9frM-qiCxdMwghr2GzeFuC9tonZd329oOh8M0CIATSS6X46dJc41LIh2jBto84MZ-zws4zIeG8FgeC4dh2FyDi8h0zoBKeIoet6l4BteA40Oc6T0AmRISPcmbvhSOYQluUxQsWLiMiYtaVlMYJLHSoFzKyzgISiwruhYF49uh-a3tQABUr5EeqJEsu41aluYHQ6IaojOPCzJQdWUFQkpHgLAsowca6Z5hDAVAxFgCQEDIEBgCGUosJkggpJw1wKoIJzpAUqaibO4nqIgtHVu0UK8topY7gMZr1FSjTBbuJazDa8HHm2qLIRYRlgCZihHOZlnWQ+T4vgRJJieSPnDDqFgBaIQUhe4YVDHYozslpVVGlMriiF0elIdxaUZWZFlWdQ2G4fZnlqiVdR+RVnhVdYNVTJW9rjA4UJ5oaUJaV1yXcZ6A0htcYDGVgkC0BQuDoGQEDUBEtD3pw5xxpk3AFCUhUzuN87uE0zjQXyJp5hBpr1f8Fg8tozj0rWrSQltXHortOUHUdEYQKd52Xddj7Pq904Zl5E2ao1hq7nJSz9FBKkjFYczfD8HgOK4DSwx2OwI1ZSPpcdqNnRdV3DXhY1Zh+bygiWXLuFV2i2syjOgtBu4M1BpjWMzBkWGz+2HZzKNo7zQ7pPe8r0AU90sPQABi3AnPKaZvXjH0fjMS60l0PR9HV5qRTo9qmBBHU2qrKUaxzGWQEkesPYIbmCDk+RFILxGlZ4VJ2P0oFS8WrFA+a3zNJCikdFpwUGoHO17SHXPhxjeXYwn3l1Mn36p0WGetO42f1FBVjgh1Lj0qBEGl-D5da6HEBV3zOEC3bb71zm9JNNYbfBdC7UgsyJomFYSx-u8NijPCQ87LgqAyJgMhJDE16ZYk-OjTPxXzsafQFjNWn9CCinMr8ov-LyLWfx1EfMIJ8z4XyvsGG+Q4TgsAIEkAodcSpDH+FvfUpZRADycCYYCpVFhVVBlCeWWCmJ2B8C2CgA14DlBPNtUIhF8bzgALRMnCowjwy0frWiWCaXo0JgrAIxOKQ4UB6EOwkqWSwJpgq0WhH0BoOChj0jGDqKEGD2qzAhp1RKiFaHnlQnxPsN4IyiKFhJXcnQwTaWLIySELQWFDE3KDFeu57SeEWOxbRnEWaGVHqZLKe0TGJzqDoDebJJiF0aD8JRpDPH6SDiPZGJ0eaXUCXPBA7dxi6hLC0BYBcN4gyUj9Ro-Rax5gEcHXxKMJ6pIJiyaRBC1EuJLD9DeXc+iF0mL9Q00wBGgPPpfa+CQanzhsAxdq2DWTwneLyDwG89Sgzmj0TBMIPE+CAA */
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        processing: false,
        photosUploaded: 0,
        creditsRemaining: 1,
      } as IMachineContext,
      on: {
        UNKNOWN_ISSUE: '.onBoarding',
      },
      states: {
        onBoarding: {
          entry: ['sendIntroOptionsMessage', 'assignDefaultValues'],
          on: {
            UPLOAD_PHOTOS: {
              actions: assign({ message: () => 'Upload Photos' }),
              target: 'imagesIncomplete',
            },
            PRICING: {
              actions: [assign({ message: () => 'Pricing' }), 'sendPricing'],
            },
            TUTORIAL: {
              actions: [assign({ message: () => 'Tutorial' }), 'sendTutorial'],
            },
            MAIN_MENU: {
              actions: assign({ message: () => 'MainMenu' }),
              reenter: true,
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstruction'],
          on: {
            PHOTO_RECEIVED: [
              {
                guard: 'canUploadMorePhotos',
                actions: ['incrementPhotoCount'],
              },
              {
                guard: 'hasUploadedEnoughPhotos',
                target: 'generatingModel',
                actions: ['incrementPhotoCount'],
              },
            ],
            BYPASS: {
              actions: assign({ message: () => 'Bypass imagesIncomplete' }),
              target: 'generatingModel',
            },
            CANCEL: {
              target: 'onBoarding',
            },
            '*': {
              actions: ['notifyPendingPhotos'],
            },
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            MODEL_GENERATED: {
              actions: ['sendModelGeneratedSuccess'],
              target: 'modelGeneratedUnpaid',
            },
            BYPASS: {
              actions: [
                'sendModelGeneratedSuccess',
                'sendSamplePhotos',
                assign({ message: () => 'Bypass generatingModel' }),
              ],
              target: 'modelGeneratedUnpaid',
            },
            CANCEL: 'onBoarding',
          },
        },
        modelGeneratedUnpaid: {
          entry: ['sendUnpaidUserOptions'],
          on: {
            BUY_CREDITS: {
              actions: ['sendPaymentInstructions'],
            },
            BYPASS: {
              actions: assign({ message: () => 'Bypass modelGeneratedUnpaid' }),
              target: 'modelGeneratedPaid',
            },
            CANCEL: {
              target: 'modelGeneratedUnpaid',
              reenter: true,
            },
            // TODO: Code payments
            PAYMENT_CONFIRMED: {
              actions: ['sendPaymentConfirmation'],
              target: 'modelGeneratedPaid',
            },
          },
        },
        modelGeneratedPaid: {
          entry: ['sendPaidUserOptions'],
          on: {
            CREATE_PHOTO: 'photoPrompting',
            BYPASS: {
              target: 'photoPrompting',
              actions: assign({
                message: (_: any, event: any) => event?.message,
              }),
            },
            CANCEL: {
              target: 'modelGeneratedPaid',
              reenter: true,
            },
          },
        },
        photoPrompting: {
          entry: ['sendPromptingInstruction'],
          on: {
            CANCEL: 'modelGeneratedPaid',
            PROMPT: {
              actions: [
                // 'decrementCredits',
                'sendPromptedPhoto',
                'sendNextStep',
              ],
              // guard: 'hasSufficientCredits',
              reenter: true,
            },
          },
        },
      },
    },
    {
      guards: guardsFactory(config),
      actions: actionsFactory(config),
    },
  );
};
