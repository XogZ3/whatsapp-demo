/* eslint-disable consistent-return */
import { type AnyActorRef, createActor } from 'xstate';

import firebase from '@/modules/firebase';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';

import { machineFactory } from './machine';
import { handleMessage } from './messageHandler';
import type { IStoreInstance, IUserMetaData, IWhatsappInstance } from './types';

const firestore = firebase.getFirestore();
// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
// Function to convert the current interpreter state to a string
function actorToString(actor: AnyActorRef) {
  const snapshot = actor.getSnapshot();
  // console.log(Date.now(), 'actorToString', snapshot.value, snapshot.context);
  return JSON.stringify(snapshot);
}

// Function to create an interpreter instance from a string representing the last state
function getActorFromString(stateString: string, whatsappStateMachine: any) {
  const savedState = JSON.parse(stateString);
  const actor = createActor(whatsappStateMachine, {
    state: savedState,
  });
  actor.start();
  return actor;
}

export const whatsappStateTransition = async (
  message: any,
  userMetaData: IUserMetaData,
) => {
  if (!message || message.type !== 'text' || !message.text) return;

  const storeInstance: IStoreInstance = {
    setContext: async (clientId: string, key: string, value: any) => {
      const clientDocRef = firestore
        .collection('apps')
        .doc(process.env.WABA_ID as string)
        .collection('clients')
        .doc(clientId);

      try {
        const clientDocSnapshot = await clientDocRef.get();

        if (clientDocSnapshot.exists) {
          const state = clientDocSnapshot.get('state');
          const stateObj = JSON.parse(state);
          stateObj.context[key] = value;

          await clientDocRef.update({
            state: JSON.stringify(stateObj),
          });
        } else {
          // Handle case when client doesn't exist
          console.error('Client does not exist');
        }
      } catch (error) {
        // Handle error
        console.error('Error updating Firestore value:', error);
        throw error;
      }
    },
  };
  const whatsappInstance: IWhatsappInstance = {
    lock: false,
    send: async (payload: ICreateMessagePayload) => {
      if (whatsappInstance.lock) {
        return delay(50).then(() => whatsappInstance.send(payload));
      }
      whatsappInstance.lock = true;
      try {
        await sendMessageToWhatsapp(payload);
      } catch (e) {
        console.log(
          `${new Date().toString()}: Unable to send whatsapp message`,
          e,
        );
      }
      whatsappInstance.lock = false;
    },
  };
  const whatsappStateMachine = machineFactory({
    userMetaData,
    storeInstance,
    whatsappInstance,
  });
  let actor: AnyActorRef;
  if (!userMetaData.state) {
    actor = createActor(whatsappStateMachine);
    actor.start();
  } else {
    actor = getActorFromString(userMetaData.state, whatsappStateMachine);
  }

  // @todo: Percolate id from whatsapp message to here, and handle actions inside handleMessage using id
  await handleMessage(
    actor,
    message.text,
    message.text.toLowerCase(),
    userMetaData,
  );

  // giving machine grace period to run invoked actions
  const startTs = Date.now();
  const thresholdTs = 3000; // 3 seconds
  while (whatsappInstance.lock && Date.now() - startTs < thresholdTs) {
    // eslint-disable-next-line no-await-in-loop
    await delay(50);
  }
  actor.stop();
  const newState = actorToString(actor);
  return newState;
};
