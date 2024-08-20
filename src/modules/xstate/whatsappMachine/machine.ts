// machine.ts

import { assign, createMachine } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        latestPrompt: '',
        latestImprovedPrompt: '',
        processing: false,
        photosUploaded: 0,
        creditsRemaining: DEFAULT_CREDITS,
        language: 'english',
      } as IMachineContext,
      on: {
        UNKNOWN_ISSUE: {
          target: '.onBoarding',
          actions: 'sendIntroOptionsMessage',
        },
      },
      states: {
        onBoarding: {
          entry: ['sendIntroOptionsMessage', 'assignDefaultValues'],
          on: {
            UPLOAD_PHOTOS: {
              actions: 'assignMessage',
              target: 'imagesIncomplete',
            },
            LANGUAGE: {
              actions: ['sendSelectLanguage', 'assignMessage'],
            },
            ENGLISH: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
              ],
              reenter: true,
            },
            portuguese: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
              ],
              reenter: true,
            },
            ARABIC: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
              ],
              reenter: true,
            },
            PRICING: {
              actions: ['assignMessage', 'sendPricing'],
            },
            TUTORIAL: {
              actions: ['assignMessage', 'sendTutorial'],
            },
            MAIN_MENU: {
              actions: ['assignMessage', 'sendIntroOptionsMessage'],
            },
            '*': {
              actions: ['sendIntroOptionsMessage'],
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstruction'],
          on: {
            PHOTO_RECEIVED: [
              {
                guard: 'canUploadMorePhotos',
                actions: [
                  'incrementPhotoCount',
                  'sendPhotosReceivedCount',
                  assign({ message: () => 'photo received' }),
                ],
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
              actions: 'assignMessage',
            },
            CANCEL: {
              target: 'modelGeneratedPaid',
              actions: 'assignMessage',
              reenter: true,
            },
          },
        },
        photoPrompting: {
          entry: ['sendPromptingInstruction'],
          on: {
            PROMPT: [
              {
                actions: [
                  // 'decrementCredits',
                  'assignMessage',
                  'assignPromptToContext',
                  'getImprovedPromptAndAssignToContext',
                  'sendPromptConfirmation',
                ],
                guard: 'machineIsAvailable',
                // guard: 'hasSufficientCredits',
                // reenter: true,
              },
              {
                actions: ['sendPleaseWait'],
              },
            ],
            USE_PROMPT: {
              actions: [
                'assignMessage',
                'assignPromptToContext',
                'getImprovedPromptAndAssignToContext',
                'assignProcessingTrue',
                'sendPromptedPhoto',
                'assignProcessingFalse',
              ],
            },
            IMPROVE_PROMPT: {
              actions: [
                'assignMessage',
                'getImprovedPromptAndAssignToContext',
                'sendImprovedPromptConfirmation',
              ],
            },
            CANCEL: {
              actions: ['sendPromptingInstruction'],
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
