// machine.ts

import { assign, createMachine, not } from 'xstate';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogCsATgB0AZgAsAdkMAObdoBMhm-qvaANCACeiAIyaAbF92jtJu6ixpqiJlZmAL6RzmhYOPhEpJRgusoAQjLoAE4QlFDUADIAgvQA4rTFZSISqrLyisqqGgj2ZrpeZu5WVsZe1l76xmbObgjuhpr6uqba+vqi7qYmxtGxGNh4hCTkVGkUmTl5FAWC5YV8ABJikkgg9QpKKnct9u66oXOTXf1d+qMeKyad7mbShQz6Mz2SGaNYgOKbRI7FL7Q65fLUAAKLAASgAVWgVQS8Gq3aRyR5NF6IN4ffxGTQ-bR-AHjMJ6HpzKYWKz6JarGLwjYJbbJPYZLLok7UYo44rpbgAYRudQpjWeoFeVnenwZTJZrkQZkMvm0-SsoiMi302mMVjhCJFSV2qQlRwxmJxSu45RVdwe6uaNMMhg+hjmxiWJlCXlZds0ul5nU67i8hlTpgdwq2zpRbqlBQJeNx3GKhT95IaTyDrRDYYjUZColjhoQXktdIhxlEmmM3bNXiz8RzyPFB0lxwKtExhRYxQAIhX7mrq9SEDpQzbuozNOYbaIrKzU14rB1gRCev1zFFBY6R2LXeP3dKAGJlwrpYqKxhLgOrzWIFYnQzIMpgbu47hmIMLZjKE7ReBMfK9jYphdEOiKii6uhkAAtugMCwNwFDEDIOG4AANmAmA0JilwsMWnA4oIiqCNwABqgiLrU-orlSAEIAEp5coMZjBJYnxHuYvhAf0iyaECV4Cusw5Ig+2F4QRREkWRlHUdQBDFD6nAEGctC-rxGrqIgXhTDMvLdhaG4moYR7eMYIHuEMphLJ5ZroU6o6pLh+FwFppEUVRNCCAAGpigheiZ9B4pwL5MYIPAGdUvDmVWfFWeMNi+EEQKiBYZjGEYh6tp4NkfLyCyaNyFqQf595YcFmnEeFuk0cUACabDvjllKWS03QmroxVwcyFW2EenTuUCjKWtuvRAq1qntRpoVdTpkXUG+hQfl+P7cZWI01gE0wQaIB4OGYUwmkeW4GH0xo+BVRiDBtmEomAai4GA2S4WAFCYJi6AuMg6DkeRB3vp+37DYGa5zdVXjdrozImDZ7YRNq9q3tmm0orgkPQ7D8NHYjp1ksuuWjR4-S+LdZg9DaaaeMYTjVd40y2lajVBCanQ-bmewdXAirKAAZmQ2R4eq1CKiw9AvtwOIEMj-75RuBjaNuD17toB5Hp4ogGO2ZjGsVww2GLgXqSFsDSxQcsK1gTzK6r6ua8I7h03+eUtHrW5AkbUIm1VYzpu5okmkMEFzBa+gO2pksu7L8uK1786CIUgh4qSqoMzWocG+Hu6R6brbW6GD23W0Ew8jeykYeLQXbZnbvZ57yhU8dSNnfTF1rnyFu3Se8nyVB+g6MYrJzxbvKieVj0-D4adbc7YV7dRENkBAWJ0QxTEsexnHa8HiC2hbpiOd4onQv8tcRAYCzlSm1j6GmW8ohnu8Ir73QIfag1R6DxWKEXYyLA87lmHkHRmBUJpTVKjNSqrJLD8wCI1Po0FuytyFCpX6Esu6AJ6gfI+4DIHQIILA-O-tA4WRrONIqB5prlQwbXSwk0wiMhCJ4fhhg-6kJ3rtIBYBKEDxplfJBt8sapnMA4IYD13BxnmLoEM-hmwYwglMERqQYBUGyJ7E4BAZAQDAHDJieIcR9VkSw34k0jBzAPHyB6PMxjCwTLYUIfZypJ0Jm3AKakjFA1MVAcxli4aHUHrTEuo9+LHncvMH4fYIKQVtJg0IHw55BD7LyIID0DG6FwKgGQmAZCYmyOFRQ0pPQsAIJiPEDi1ypiGJNXGnRvC2HbDBLQ6ZEwRj7MMZkExBxE2IR3Up5TKnVNqRiWgJJOANKaS0hBzC2k2Qtg1BCUx2EGxGK2dMehvDdFEhaXoEIoQlLKRUqpNSyJ1IKNwJpOIWAcRWe8tZrSkneF8EMcEJ5rQLBcq2BwccIh2z2RjBwwjJnt0dncuZjzcDPO9klGKyVVnNN+flVMvRNHAj5CEKOdoX5eL6H4M0ERQgRDxp4W5syHkLNfAjE6eKxqDFDNzEIfY+RATntHI07wLQnnjBESEU8SnEHQMRKxvAACuAAjWAxBgZoq9oqUoLF4FMNLm0wqvCSplVmsK9c7YZjhhPNqOYP8glEMRWpWV8ryJKtVeqsgmr+68GKC+YuPEDVJKNag01XCxg2QTIMME390whkajKuVxAFUqrVRqpWsSZEbKDfikN7C0GcLRmMEZr0LQWGsKo76cIKAWLgKoO8JMqAJJRvxAAtP0hAraEyWEsKYNMH99naBKfmSczadavEWJbKewJew2ghBSjwy1NFdDZn2PZSiSkAPET1Md18EDGgtp5T+-hbTAs0K5KCk1vBglAvHVOCKQlYX+oDYGOFQbg3JjDciu6kE6AMCYUE1hbAXk8R4XlMwliCsyTye9wS2qk0-bDH9LDezvEBWEYFnkFgduPNMWeJpLQni6PJTdXdXbuxznlRBNYuj1y+BzbUUFBiLxsLoKEsxBX0n8EpR1j7-5kO3ZFShyG1w3stgR0qwQ0w1zGBWxMZaTRmgqu4SwJSwkmOeVEqxImkk+AttYW6JgK5gkgmbO0V6+W7kZEBXoTL7nzKefkHT+K9NYwtGEbm3QTNHIjQENjnRC0Hj6JaRNrr3Vpq9S2keUWxphHeGCQqB4D3alZDoaYwRQW9GvbHaI0QgA */
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
            MALAY: {
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
