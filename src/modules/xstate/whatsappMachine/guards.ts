import {
  getProcessingFlag,
  getUserLoraDetails,
} from '@/utils/ReplyHelper/FirebaseHelpers';

import type { IMachineConfig } from './types';

export const guardsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    hasSufficientCredits: (event: any) => {
      const hasSufficient = event?.context?.creditsRemaining > 0;
      return hasSufficient;
    },
    machineIsAvailable: async () => {
      const isAvailable =
        (await getProcessingFlag(_machineConfig.userMetaData.phonenumber)) ===
        false;
      return isAvailable;
    },
    modelNotCreated: async (event: any) => {
      const { loraURL, loraFilename } = await getUserLoraDetails(
        event?.event?.userMetaData?.phonenumber,
      );
      console.log('[O] guard: modelNotCreated: lora?', loraFilename, loraURL);
      if (loraURL || loraFilename) return false;
      return true;
    },
  };
};
