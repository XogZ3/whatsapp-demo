import type { IMachineConfig, IMachineContext } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    modelAlreadyGenerated: ({ context }: { context: IMachineContext }) => {
      const modelGenerated = context?.modelGenerated === true;
      return modelGenerated;
    },
  };
};
