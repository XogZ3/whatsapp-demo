import { getProcessingFlag } from '@/utils/ReplyHelper/FirebaseHelpers';

import type { IMachineConfig, IMachineContext } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    hasSufficientCredits: (event: any) => {
      const hasSufficient = event?.context?.creditsRemaining > 0;
      return hasSufficient;
    },
    machineIsAvailable: async () => {
      const isAvailable =
        (await getProcessingFlag(_machineConfig.userMetaData.clientid)) ===
        false;
      return isAvailable;
    },
    modelAlreadyGenerated: ({ context }: { context: IMachineContext }) => {
      const modelGenerated = context?.modelGenerated === true;
      return modelGenerated;
    },
  };
};
