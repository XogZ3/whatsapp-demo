// machine.ts

import { createMachine } from 'xstate';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6JtAZgCMAOlHbRtgOymzmgBwA2MwFYAvl-1osOPhEpJRgFsoAQjLoAE4QlFB0AAoAMiwAggAinEkAEiwAKiy8YpJIILLyisqqGgjOzpoWdia2mmYAnK4doiaadvpGCCaudhZOHWZ2DZqirh7ampo+fhjYeIQk5FThFFGx8RSJSQBK3ADC3PQA4qWqlQpKKuV1rq5NLq7adh02zgumQbGbSuCzOUR2DyiTQjSEdEYrED+dZBLahXb7OIJagFWhFM7pFJ3coParPUCvL7NebQqYmEFmVxAhBmcwWbQ2WzmcxmXqmRHIwKbEI7SLRLFHagEdJXTgEQT0WjE6RyR41F6IN6WEy-DytEF2MxmZx6QyIZyWSaaDodaYeXnvPUCtZC4LbMJkAC26BgsG4FGIMk9uAANmBMDQ8oUWJwToJzoJuAA1QSZZUVVVk2qII0dZwWeaQ1wmDw2xrmZkjDrNEyQo3fKF9Za+JEujZu9Fen1wf2B4NhiPUKNFWPxxMptNmMoqqpPbP1Ro1tqdbq9frM-qiCxdMwghr2GzeFuC9tonZd329oOh8M0CIATSS6X46dJc41LIh2jBto84MZ-zws4zIeG8FgeC4dh2FyDi8h0zoBKeIoet6l4BteA40Oc6T0AmRISPcmbvhSOYQluUxQsWLiMiYtaVlMYJLHSoFzKyzgISiwruhYMBUDEWAJAQMgQGAIZSiwmSCCknDXAqggnOkBSpq+RHqiRww6hY7RQry2iljuAxmvUVKNHpu4lrMNrwcebaoshPFgHxAlHEJIliQ+T4vgRJKqeS6iILR1baaIun6e4hlDHYozsh4OlGlMriiF0HGumeYS8WA-GKC5wmidQ2G4VJKmzmp-kaUFnghdYYVTJW9rjA4UJ5oaUKxSlSHcZ6uUhtcjmZVgkC0BQuDoGQEDUBEtD3pw5xxpk3AFCU3kzmqfmvE4YLQXyJp5hBpqRf8Fg8tozj0rWrSQu1dmdd1vVORGEBDSNY0TY+z5LdOGYlWtmrRYau4dEsSxQRFiAtKCthfFBHQeA4rgNFdXHol1bl3f1D1PaN40FXhxWrfObygiWXLuCF2i2sy8OgtBu5w1BpjWIjHY7Cjolo1lg3DVjQ7pPe8r0AUM0sPQABi3AnPKabLV9+MfjMS60l0PR9KDxnfqZ9qmBBSU2kzaUWKzPV9RzEBJNzs2CIpgg5PkRR41mH6eFSdj9KB5PFqx+3mt8zSQqIzgwwsCyjHr9mG+zA2m9zHnvfbxFlU734u0W7utO4Xv1FBVjgklLj0qBEGhzdqPG5HZsvTjRXS2+pV1KyixWAzXxQpoiUgsyJomFYSx-u8NijPCRforgqAyJgMhJDE17ZYklf4Z9Nc-Syp1NO4rUQXD-vMr8RP-LyIW7olOpDzsI9jxPU-BjPQ4nCwBBJILw4xnGACKQi8EpUsL7584rl3SWQliqWf2UwzDMkaptPSupNB-koifMIZ9x6T2ntiU4d8H422jKON+ggP7KSnIRb6v83bNFdl8LoaddzgOmFpLapkHAuAtD4FsFBcrwHKCea6oRCGy3UgAWiZEZARVhbC9HePFd4AdrKrEQlw0UexxSHCgDwh26lSyWBNHpWi0I+gNGAkZekYwdRQlECxWYp1ko2VkUjc8qEezoX7LeFR8c67aE6GCIOxZGSQnBhuaCR09Jk3tJ4RY7ErGcWZulUuM9XKiWcbXLQGdTqWk6H+fo8Jvh2HgQbW60TObPQgPEpe6dxi6hLC0BY-sOgd0OgHZw0xga1jzNk8OeSo5jSKb-LRR1Wrpz1H+VW9SjHWnUVtQ00xsmIIvigo4nSPw2AYkfC0OoRjtFMR3PUR1qo9ALk4EwYSfBAA */
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        processing: false,
        pendingPhotos: 0,
        creditsRemaining: 0,
      } as IMachineContext,
      on: {
        UNKNOWN_ISSUE: '.onBoarding',
      },
      states: {
        onBoarding: {
          entry: ['sendIntroOptionsMessage', 'assignDefaultValues'],
          on: {
            UPLOAD_PHOTOS: {
              target: 'imagesIncomplete',
            },
            PRICING: {
              actions: ['assignMessage', 'sendPricing'],
              target: 'onBoarding',
            },
            TUTORIAL: {
              target: 'onBoarding',
              actions: ['sendTutorial'],
            },
            MAIN_MENU: {
              target: 'onBoarding',
              reenter: true,
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstruction'],
          on: {
            // TODO: code receiving photos
            PHOTO_RECEIVED: [
              {
                target: 'imagesIncomplete',
                actions: ['incrementPhotoCount'],
                guard: 'needMorePhotos',
              },
              {
                target: 'generatingModel',
                actions: ['incrementPhotoCount'],
              },
            ],
            BYPASS: {
              target: 'generatingModel',
            },
            CANCEL: {
              target: 'onBoarding',
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
              actions: ['sendModelGeneratedSuccess', 'sendSamplePhotos'],
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
              target: 'modelGeneratedPaid',
              reenter: true,
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
            BYPASS: 'photoPrompting',
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
            '*': {
              actions: ['echoEvent'],
            },
            PROMPT_PHOTO_REQUESTED: [
              {
                target: 'photoPrompting',
                actions: ['decrementCredits', 'generatePromptedPhoto'],
                guard: 'hasCredits',
              },
              {
                target: 'modelGeneratedPaid',
              },
            ],
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
