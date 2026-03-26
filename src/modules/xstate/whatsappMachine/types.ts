import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import type { Language } from '@/utils/translations';

// MachineConfig Type Definition
export interface IMachineConfig {
  userMetaData: IUserMetaData;
  storeInstance: IStoreInstance;
  whatsappInstance: IWhatsappInstance;
}

export interface IStoreInstance {
  setContext: (clientid: string, key: string, value: any) => Promise<void>;
}

export interface IWhatsappInstance {
  lock: boolean;
  send: (payload: ICreateMessagePayload) => Promise<void>;
}

export interface IMachineContext {
  message: string;
  latestPrompt: string;
  latestImprovedPrompt: string;
  modelGenerated: boolean;
  language: Language;
  age: number;
  gender: 'male' | 'female';
  shortenedStripeLink: string;
}

export interface IUserMetaData {
  age: number;
  gender: 'male' | 'female';
  state: string;
  clientid: string;
  name?: string;
  language: Language;
}

export interface UploadPhotoEvent {
  type: 'UPLOAD_PHOTO';
}

export interface PaymentSuccessEvent {
  type: 'PAYMENT_SUCCESSFUL';
}

export type MachineEvents =
  | UploadPhotoEvent
  | PaymentSuccessEvent
  | { type: 'UNKNOWN_ISSUE' };

// interface EventDetails {
//   type: string;
//   message: string;
//   userMetaData: IUserMetaData;
// }

// interface Self {
//   xstate$$type: any;
//   id: any;
// }

// interface SystemSnapshot {
//   _scheduledEvents: any;
// }

// interface System {
//   _snapshot: SystemSnapshot;
//   scheduler: any;
//   _clock: any;
// }

// export interface IEvent {
//   context: IMachineContext;
//   event: EventDetails;
//   self: Self;
//   system: System;
// }
