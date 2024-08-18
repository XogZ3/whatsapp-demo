import { TRAINING_IMAGES_LIMIT } from '@/utils/constants';

import type { IMachineConfig } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    canUploadMorePhotos: (context: any) =>
      context.photosUploaded < TRAINING_IMAGES_LIMIT,
    hasUploadedEnoughPhotos: (context: any) =>
      context.photosUploaded + 1 === TRAINING_IMAGES_LIMIT, // Adding 1 since the N-th photo will trigger this guard
    hasSufficientCredits: (context: any) => context.creditsRemaining > 0,
  };
};
