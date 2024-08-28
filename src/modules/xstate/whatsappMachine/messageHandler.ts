// messageHandler.ts

import type { AnyActorRef } from 'xstate';

export const State = Object.freeze({
  onBoarding: 'onBoarding',
  imagesIncomplete: 'imagesIncomplete',
  generatingModel: 'generatingModel',
  modelGeneratedFreeTrial: 'modelGeneratedFreeTrial',
  paywall: 'paywall',
  photoPrompting: 'photoPrompting',
});

export const states: (keyof typeof State)[] = Object.values(State);

export const imageAcceptingStates: (keyof typeof State)[] = [
  State.imagesIncomplete,
];

export const nonImageAcceptingStates = states.filter(
  (state) => !imageAcceptingStates.includes(state),
);

export const handleMessage = async (
  actor: AnyActorRef,
  message: string,
  userActionId: string,
  userMetaData: {},
) => {
  const STATE_ACTION_EVENT_MAP: any = {
    [State.onBoarding]: {
      'upload photos': 'UPLOAD_PHOTOS',
      pricing: 'PRICING',
      language: 'LANGUAGE',
      english: 'ENGLISH',
      portuguese: 'PORTUGUESE',
      arabic: 'ARABIC',
      tutorial: 'TUTORIAL',
    },
    [State.imagesIncomplete]: {
      'photo received': 'PHOTO_RECEIVED',
      'generate model': 'GENERATE_MODEL',
      cancel: 'CANCEL',
    },
    [State.generatingModel]: {
      retry: 'RETRY',
      'model generated': 'MODEL_GENERATED_UNPAID',
      secret: 'SECRET',
    },
    [State.paywall]: {
      'get membership': 'GET_MEMBERSHIP',
      secret: 'SECRET',
      cancel: 'CANCEL',
    },
    [State.modelGeneratedFreeTrial]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      fallback: 'FALLBACK',
    },
    [State.photoPrompting]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      paywall: 'PAYWALL',
      fallback: 'FALLBACK',
      cancel: 'CANCEL',
    },
  };

  const state = actor.getSnapshot().value as string;
  console.log('Current state: ', state);

  let event;

  if (
    (state === State.modelGeneratedFreeTrial ||
      state === State.photoPrompting) &&
    !['cancel', 'use prompt', 'improve prompt', 'paywall', 'fallback'].includes(
      userActionId,
    )
  ) {
    event = STATE_ACTION_EVENT_MAP[state].prompt;
    console.log('Prompt: ', message);
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
