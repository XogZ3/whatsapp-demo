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
    modelGeneratedUnpaid: 'modelGeneratedUnpaid',
    modelGeneratedPaid: 'modelGeneratedPaid',
    photoPrompting: 'photoPrompting',
  });

  const STATE_ACTION_EVENT_MAP: any = {
    [State.onBoarding]: {
      'upload photos': 'UPLOAD_PHOTOS',
      pricing: 'PRICING',
      language: 'LANGUAGE',
      english: 'ENGLISH',
      portuguese: 'portuguese',
      arabic: 'ARABIC',
      tutorial: 'TUTORIAL',
      'main menu': 'MAIN_MENU',
    },
    [State.imagesIncomplete]: {
      'photo received': 'PHOTO_RECEIVED',
      'generate model': 'GENERATE_MODEL',
      bypass: 'BYPASS',
      cancel: 'CANCEL',
    },
    [State.generatingModel]: {
      'model generated': 'MODEL_GENERATED_UNPAID',
      bypass: 'BYPASS',
      cancel: 'CANCEL',
    },
    [State.modelGeneratedUnpaid]: {
      'buy credits': 'BUY_CREDITS',
      bypass: 'BYPASS',
      cancel: 'CANCEL',
      'payment confirmed': 'PAYMENT_CONFIRMED',
    },
    [State.modelGeneratedPaid]: {
      'create photo': 'CREATE_PHOTO',
      bypass: 'BYPASS',
      cancel: 'CANCEL',
      'payment confirmed': 'PAYMENT_CONFIRMED',
    },
    [State.photoPrompting]: {
      prompt: 'PROMPT',
      'use prompt': 'USE_PROMPT',
      'improve prompt': 'IMPROVE_PROMPT',
      cancel: 'CANCEL',
    },
  };

  const state = actor.getSnapshot().value as string;
  console.log('Current state: ', state);

  let event;

  if (
    state === 'photoPrompting' &&
    !['cancel', 'use prompt', 'improve prompt'].includes(userActionId)
  ) {
    event = STATE_ACTION_EVENT_MAP[state].prompt;
    console.log('Prompt: ', message);
  } else if (STATE_ACTION_EVENT_MAP[state]) {
    event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'onBoarding';
  } else {
    event = 'onBoarding';
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
