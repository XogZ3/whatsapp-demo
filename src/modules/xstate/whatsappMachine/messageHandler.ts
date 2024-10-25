// messageHandler.ts

import type { AnyActorRef } from 'xstate';

export const State = Object.freeze({
  onBoarding: 'onBoarding',
  imagesIncomplete: 'imagesIncomplete',
  generatingModel: 'generatingModel',
  experimentPaywall: 'experimentPaywall',
  paywall: 'paywall',
  imagesConfirmation: 'imagesConfirmation',
  imagesIncompletePaid: 'imagesIncompletePaid',
  photoPrompting: 'photoPrompting',
  cancelSubscription: 'cancelSubscription',
});

export const states: (keyof typeof State)[] = Object.values(State);

export const imageAcceptingStates: (keyof typeof State)[] = [
  State.imagesIncomplete,
  State.photoPrompting,
];

export const nonImageAcceptingStates = states.filter(
  (state) => !imageAcceptingStates.includes(state),
);

function isStringifiedJSON(str: string) {
  try {
    // Try to parse the string
    JSON.parse(str);
    return true; // If parsing succeeds, it's valid JSON
  } catch (e) {
    return false; // If parsing fails, it's not valid JSON
  }
}

export const handleMessage = async (
  actor: AnyActorRef,
  message: string,
  userActionId: string,
  userMetaData: {},
) => {
  const STATE_ACTION_EVENT_MAP: any = {
    [State.onBoarding]: {
      upload: 'UPLOAD',
      'upload photos': 'UPLOAD',
      'carregar fotos': 'UPLOAD',
      pricing: 'PRICING',
      language: 'LANGUAGE',
      english: 'ENGLISH',
      portuguese: 'PORTUGUESE',
      arabic: 'ARABIC',
      tutorial: 'TUTORIAL',
    },
    [State.imagesIncomplete]: {
      'photo received': 'PHOTO_RECEIVED',
      paywall: 'PAYWALL',
      'main menu': 'MAIN_MENU',
      experimentFreeImages: 'EXPERIMENT_FREE_IMAGES',
      fallback: 'FALLBACK',
    },
    [State.generatingModel]: {
      retry: 'RETRY',
    },
    [State.experimentPaywall]: {
      fallback: 'FALLBACK',
    },
    [State.paywall]: {
      fallback: 'FALLBACK',
    },
    [State.imagesConfirmation]: {
      confirm: 'CONFIRM',
      delete: 'DELETE',
      fallback: 'FALLBACK',
    },
    [State.imagesIncompletePaid]: {
      'photo received': 'PHOTO_RECEIVED',
      'generate model': 'GENERATE_MODEL',
      fallback: 'FALLBACK',
    },
    [State.photoPrompting]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      context_prompt: 'CONTEXT_PROMPT',
      fallback: 'FALLBACK',
      secret: 'SECRET',
    },
    [State.cancelSubscription]: {
      'cancel subscription': 'CANCEL',
      'back to safety': 'SAFE',
      'Cancelar assinatura': 'CANCEL',
      'Voltar seguro': 'SAFE',
    },
  };

  const state = actor.getSnapshot().value as string;
  console.log('Current state: ', state);

  let event;

  if (
    state === State.photoPrompting &&
    !['use prompt', 'improve prompt', 'fallback', 'secret'].includes(
      userActionId,
    )
  ) {
    if (!isStringifiedJSON(message)) {
      event = STATE_ACTION_EVENT_MAP[state].prompt;
      console.log('Prompt: ', message);
    } else if (JSON.parse(message).type === 'context_message') {
      event = STATE_ACTION_EVENT_MAP[state].context_prompt;
    }
  } else if (STATE_ACTION_EVENT_MAP[state]) {
    event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'FALLBACK';
  } else {
    event = 'FALLBACK';
  }

  console.log(
    'actor sending: ',
    JSON.stringify({ type: event, message, userMetaData }),
  );

  actor.send({
    type: event,
    message,
    userMetaData,
  });
};
