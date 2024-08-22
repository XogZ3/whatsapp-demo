import { TRAINING_IMAGES_LIMIT } from '@/utils/constants';
import { getPhotoCount } from '@/utils/ReplyHelper/FirebaseHelpers';

import type { IMachineConfig } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    canUploadMorePhotos: async () => {
      const uploadedPhotosCount = await getPhotoCount(
        _machineConfig.userMetaData.phonenumber,
      );
      // console.log('[~~] Guard: canUploadMorePhotos');
      // console.log('[~~] context logs', JSON.stringify(event, null, 2));
      const canUpload = (uploadedPhotosCount || 0) < TRAINING_IMAGES_LIMIT;
      // console.log('[~~] photosUploaded:', event?.context.photosUploaded);
      return canUpload;
    },
    hasUploadedEnoughPhotos: async () => {
      const uploadedPhotosCount = await getPhotoCount(
        _machineConfig.userMetaData.phonenumber,
      );
      const hasUploaded = uploadedPhotosCount >= TRAINING_IMAGES_LIMIT - 1;
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
