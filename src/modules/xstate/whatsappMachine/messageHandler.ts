// messageHandler.ts

import type { AnyActorRef } from 'xstate';

export const handleMessage = async (
  actor: AnyActorRef,
  message: string,
  userActionId: string,
  userMetaData: {},
) => {
  const State = Object.freeze({
    onBoarding: 'onBoarding',
    imagesIncomplete: 'imagesIncomplete',
    generatingModel: 'generatingModel',
    modelGeneratedFreeTrial: 'modelGeneratedFreeTrial',
    paywall: 'paywall',
    photoPrompting: 'photoPrompting',
    wipPhotoPrompting: 'wipPhotoPrompting',
  });

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
      fallback: 'FALLBACK',
    },
    [State.generatingModel]: {
      'model generated': 'MODEL_GENERATED_UNPAID',
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
    },
    [State.photoPrompting]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      cancel: 'CANCEL',
      secret: 'SECRET',
    },
    [State.wipPhotoPrompting]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      cancel: 'CANCEL',
      secret: 'SECRET',
      paywall: 'PAYWALL',
    },
  };

  const state = actor.getSnapshot().value as string;
  console.log('Current state: ', state);

  let event;

  if (
    (state === 'photoPrompting' || state === 'wipPhotoPrompting') &&
    !['cancel', 'use prompt', 'improve prompt', 'secret', 'paywall'].includes(
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
