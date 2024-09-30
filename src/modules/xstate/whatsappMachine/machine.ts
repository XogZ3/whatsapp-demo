// machine.ts

import { assign, createMachine, not } from 'xstate';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout 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 */
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        latestPrompt: '',
        latestImprovedPrompt: '',
        modelGenerated: false,
        language: 'english',
        age: 25,
        gender: 'male',
        shortenedStripeLink: '',
      } as IMachineContext,
      on: {
        UNKNOWN_ISSUE: {
          target: '.onBoarding',
          actions: 'sendIntroOptionsMessage',
        },
      },
      states: {
        onBoarding: {
          entry: ['assignDefaultValues'],
          on: {
            // UPLOAD_PHOTOS: {
            //   actions: 'assignMessage',
            //   target: 'imagesIncomplete',
            // },
            LANGUAGE: { actions: ['sendSelectLanguage', 'assignMessage'] },
            ENGLISH: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            PORTUGUESE: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            ARABIC: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            PRICING: { actions: ['assignMessage', 'sendPricing'] },
            TUTORIAL: { actions: ['assignMessage', 'sendTutorial'] },
            FALLBACK: {
              actions: ['sendIntroOptionsMessageBasedOnPhoneNumber'],
            },
          },
        },
        imagesIncomplete: {
          // entry: ['sendPhotoUploadInstruction'],
          on: {
            PHOTO_RECEIVED: {
              actions: [assign({ message: () => 'photo received' })],
            },
            GENERATE_MODEL: [
              {
                guard: not('modelAlreadyGenerated'),
                target: 'generatingModel',
                actions: ['callStartTrainingAPI', 'saveAgeAndGender'],
              },
              {
                actions: ['notifyModelExists'],
                target: 'photoPrompting',
              },
            ],
            FALLBACK: { actions: 'sendPendingPhotos' },
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            RETRY: { actions: ['callStartTrainingAPI', 'setRetriedFlagTrue'] },
            FALLBACK: { actions: 'handleModelGenerationStatus' },
          },
        },
        paywall: {
          entry: ['sendPaywall'],
          on: {
            FALLBACK: { actions: 'sendPaywall' },
          },
        },
        photoPrompting: {
          on: {
            PROMPT: [
              {
                actions: [
                  'assignMessage',
                  'assignPromptToContext',
                  'sendPromptConfirmation',
                ],
              },
            ],
            USE_PROMPT: { actions: ['assignMessage', 'sendPromptedPhoto'] },
            IMPROVE_PROMPT: {
              actions: [
                'assignMessage',
                'sendImprovedPromptConfirmationAndSetContext',
              ],
            },
            CONTEXT_PROMPT: {
              actions: ['assignMessage', 'sendPromptedContextPhoto'],
            },
            FALLBACK: { actions: ['sendPromptingInstruction'] },
          },
        },
        cancelSubscription: {
          on: {
            CANCEL: {
              actions: ['cancelSubscription'],
              target: 'photoPrompting',
            },
            SAFE: {
              actions: [
                'sendCancellationCancelled',
                'sendPromptingInstruction',
              ],
              target: 'photoPrompting',
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
