// machine.ts

import { assign, createMachine, not } from 'xstate';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogDsADgB0AJm0BGfQBYArPoCcANhtXzAZisAaEAE9E+k5t3Oj2qY2mjZGjqYhAL6RbmhYOPhEpJRgusoAQjLoAE4QlFDUADIAgvQA4rTFZSISqrLyisqqGgiOmua62oHOxs6i1kambp4I+qJGNroT+uahNvrhRtGxGNh4hCTkVGkUmTl5FAWC5YV8ABJikkgg9QpKKtctjjZ6mqKOJlbWVtqOor-DRABAJTeazbTvGxBGbLEBxNaJTYpHZ7XL5agABRYACUACq0CqCXg1K7SOR3JqPRDPV7vT7fX7-RyAhDTUSgmaaUzchxGSyw+EJDbJbYZLJow7UYrY4rpbgAYUudXJjQeoCeL10bw+1gZfwBHiBpn0+g5pisPwtfKWMThqyFSS2qTF+3RGOxCu45SV11uqua1KsRi1s30mjGJq+7xZYX6UzMVn+NksRlE-NtgvWjuRLolBXxuJx3GKhR9ZIa9wDrSDIfm4f6uujhtZAVN-00PRpEXmAvtWaRot24oOBVoGMKLGKABEyzcVZWqQgbM8pjqIaYuuZtFZmc3vMbdOZRONROHzBbjeZe-F+yLnUPXZKAGIlwrpYryxizv0L9XUvm6FY5oWr84RAdYNgxv8ejvFyzzmhuVjtNeCLCk6uhkAAtugMCwNwFDEDImG4AANmAmA0BiZwsIWnDYoI8qCNwABqggzrUvrzpSf4ICBgGmKejicm8ISaCyYzmL4MzaJYgSppoAQoQ6A6pFhOFwPhhHEWRFGYsUACabCvt+XFquoQJtKaqYfEGEzmOeabiQE7IRtYx5-MEphKbe6FqbhmlEaR5E0C+hRvh+X4ceWFJmS0FpWFMx6iC8W6pu8rjNkYtiOAY-yzMmbRhEB3mIneui4Og7jIOgJEkdQoXhZ+JkVtx5msgpph+Hy5hBOMThpvo4nJTlbymG0djtC8yUlWhyJ+XA8rKAAZmQ2TYaq1Dyiw9BPtw2IEM1MVVuEeh-B8ph8hE4wCUMzYOL48VfPMRgmClM3Zts82wItFArWtWD3Jt227ftwhGKSc4tbF1Ibn4dIXT1byDKIt0jEEnVhkejjbgJKM-FeGZ9qVvnYbhP1-etgNToIhSCLiJLKlDx2w2dgyXUjN0sjokyiEGDmGPMhheYTN7E3NpMLctq2U8o9Wvu+TVRZDR2LgeSXqxr11c7zfgDOe1lCU470qRhEt4QRgU6WAGLoGQECYtRtH0YxLFsYd-qLvYVm89jnnLhCkHNm87IyUlWVBmGRiaMbZVfQF2nBTbdvUNU9CCDK9OcAQLDU6WSs-q1cUHrYMz2FCiHPCyEKmhuL0KclQE9THJPqebWlBRRSf26n6fFJn2e52DEMF9DvFtIBYJl9y26V0HcZcmeyXcqmPzN+Lrfxx31u2-bDUK5Fw+mVWXsGC8IRCUJ4zzCyNjJZ0SUCXX9hCWv2wwFQ2QA4cBAyBAYB1fRXE2J9Lu1-G1MIwQDDjQgZoH48kq6ajMM8Ho54vjPFfqkd+YBP6KG-r-f+cswr71AYXCyK4xphAQrzSwPUuZcimDuYIsDtDLgsPoDB5VUAyEwDIDE2RAq4IKO6FgBAMS4hIaPShegHLLk0OGdoWUWSzE6s-UIjhEYWhsBw3AXCeF8IEeiWgxJODCNEeI-OR9FwQODHBHQY1g68xZNyFRsxrL6ChM8N4WiRaoQ+qkHR3DeH8OIoI6g3BRHYhYKxExkSzESKrD4XwOgwhjBYYMFhgcRhCRUQESSwQuhpgiNo3RQSDGSi2vQemAANXEMSRFiPiVYxw2NOjJM8ZHI8mSvAo0PMYZKyYUaXg7MUwJ+iQnoj3hFRpPFKGTBNMYRMSVNHaBjKmQ8Hwl6DCDNjWwHDiDoAIv-XgABXAARrAYg2QyC4A2vKUojE86HyZoucCE9S62GnowquwZghHhPP0IINC9kHOIEcs5Fyrk3MBrwYoT4GacWeTxV5JdZgfIrl09qHRF7vHUXIyw7xgWHJIic85lzrkbUmYrJ5KskXF0nmimeGLrBYrBNYX4AkoQwlhBQfB8BriZjFlQRmNK2oAFoOiPUlY9FhLJxWASlVK48BMVii1moOVEI5hUex4idOG512bXRRk5C6uU+qGFGrMDhccLYJwolqsBRdTQoqnuipysw4aBETELCC3iVW+JNhVKqNUSL2tIayDxoJtDtGaVGxMTLpghjGtjHqXxzxWrNuTaWANWojyrDoAwxgzCWFsPYWhzYISnVgSYXmIREzY3TRvG1W8u6htHsuSYYQTDrk3DPLmFpOjxX9lCUO7CfHKTKlgnB+Qf5-xDQikVLQwjhkSjZF6yYHLmBZBaHKhgXpHkGOoywvq7Sqr8Zw0ZwSoWHFbQkyyK6sprvsomTdQcAIKTSfZYIQtCWguJeCslUKc2WJ4nBLU7QUZhC6CYawTlgzHjBKGcMHwdDRGiEAA */
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
          actions: 'sendIntroMessage',
        },
      },
      states: {
        onBoarding: {
          entry: ['assignDefaultValues'],
          on: {
            LANGUAGE: { actions: ['sendSelectLanguage', 'assignMessage'] },
            ENGLISH: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroMessage',
              ],
            },
            PORTUGUESE: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroMessage',
              ],
            },
            ARABIC: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroMessage',
              ],
            },
            PRICING: { actions: ['assignMessage', 'sendPricing'] },
            TUTORIAL: { actions: ['assignMessage', 'sendTutorial'] },
            UPLOAD: { actions: ['assignMessage'], target: 'imagesIncomplete' },
            FALLBACK: {
              actions: ['sendIntroMessageBasedOnPhoneNumber'],
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstructionWithMenuButton'],
          on: {
            PHOTO_RECEIVED: {
              actions: [assign({ message: () => 'photo received' })],
            },
            MAIN_MENU: {
              actions: ['sendIntroMessage'],
              target: 'onBoarding',
            },
            EXPERIMENT_FREE_IMAGES: {
              actions: ['callStartTrainingAPI', 'saveAgeAndGender'],
              target: 'generatingModel',
            },
            PAYWALL: { target: 'paywall' },
            FALLBACK: { actions: 'sendPendingPhotos' },
          },
        },
        experimentPaywall: {
          on: {
            FALLBACK: {
              actions: ['sendExperimentPaywall', 'setPaywallSentTimestamp'],
            },
          },
        },
        paywall: {
          entry: ['sendPaywall', 'setPaywallSentTimestampDiscountSentFalse'],
          on: {
            FALLBACK: { actions: 'sendPaywall' },
          },
        },
        imagesConfirmation: {
          on: {
            CONFIRM: [
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
            DELETE: {
              actions: ['deleteImages', 'sendPhotoUploadInstruction'],
              target: 'imagesIncompletePaid',
            },
            FALLBACK: { actions: 'sendUploadedImagesConfirmation' },
          },
        },
        imagesIncompletePaid: {
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
            FALLBACK: {
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
