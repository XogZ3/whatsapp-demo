import { TRAINING_IMAGES_LIMIT } from '@/utils/constants';

import type { IMachineConfig } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    canUploadMorePhotos: (event: any) => {
      console.log('[~~] Guard: canUploadMorePhotos');
      console.log('[~~] context logs', JSON.stringify(event, null, 2));
      const canUpload =
        (event?.context?.photosUploaded || 0) < TRAINING_IMAGES_LIMIT;
      console.log('[~~] photosUploaded:', event?.context.photosUploaded);
      return canUpload;
    },
    hasUploadedEnoughPhotos: (event: any) => {
      const hasUploaded =
        (event?.context?.photosUploaded || 0) + 1 === TRAINING_IMAGES_LIMIT; // Adding 1 since the N-th photo will trigger this guard
      return hasUploaded;
    },
    hasSufficientCredits: (event: any) => {
      const hasSufficient = event?.context?.creditsRemaining > 0;
      return hasSufficient;
    },
    machineIsAvailable: (event: any) => {
      const isAvailable = event?.context?.processing === false;
      return isAvailable;
    },
  };
};
