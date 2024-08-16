import type { IMachineConfig } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    hasProfile: (context: any) => context.interests?.length > 0,
    canUploadMorePhotos: (context: any) => context.photosUploaded < 15,
    hasUploadedEnoughPhotos: (context: any) => context.photosUploaded === 15,
    hasSufficientCredits: (context: any) => context.remainingCredits > 0,
  };
};
