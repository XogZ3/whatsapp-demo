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
      tutorial: 'TUTORIAL',
      'main menu': 'MAIN_MENU',
    },
    [State.imagesIncomplete]: {
      'photo received': 'PHOTO_RECEIVED',
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
      cancel: 'CANCEL',
    },
  };

  const state = actor.getSnapshot().value as string;
  console.log('state: ', state);

  if (!STATE_ACTION_EVENT_MAP[state]) {
    actor.send({ type: 'UNKNOWN_ISSUE' });
  } else {
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'UNKNOWN_ISSUE';
    console.log(
      'actor sending: ',
      JSON.stringify({ type: event, message, userMetaData }),
    );
    actor.send({
      type: event,
      message,
      userMetaData,
    });
  }
};
