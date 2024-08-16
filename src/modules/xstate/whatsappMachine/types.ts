import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';

// MachineConfig Type Definition
export interface IMachineConfig {
  userMetaData: IUserMetaData;
  storeInstance: IStoreInstance;
  whatsappInstance: IWhatsappInstance;
}

export interface IStoreInstance {}

export interface IWhatsappInstance {
  lock: boolean;
  send: (payload: ICreateMessagePayload) => Promise<void>;
}

export interface IMatchInstance {
  findmatch: (clientId: string) => Promise<string | null>;
}

export interface IMachineContext {
  message: string;
  processing: boolean;
  pendingPhotos: number;
  creditsRemaining: number;
  modelGenerated: boolean;
}

export interface IUserMetaData {
  state?: string;
  phonenumber: string;
  name?: string;
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
