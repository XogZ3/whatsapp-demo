import type { IMachineConfig, IMachineContext } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    hasFreeTrialCredits: ({ context }: { context: IMachineContext }) => {
      const hasSufficient = context?.freeTrialCredits > 0;
      return hasSufficient;
    },
    modelAlreadyGenerated: ({ context }: { context: IMachineContext }) => {
      const modelGenerated = context?.modelGenerated === true;
      return modelGenerated;
    },
  };
};
