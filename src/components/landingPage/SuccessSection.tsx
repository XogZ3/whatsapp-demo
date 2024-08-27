/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/libs/utils';
import { sendPurchaseToFBCoversionAPI } from '@/utils/fconversionHelper';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';
import { DotPattern } from '../ui/magicui/dot';

export default function SuccessSection({ clientid }: { clientid: string }) {
  React.useEffect(() => {
    if (clientid) {
      const sendEvent = async () => {
        console.log('[O] Attempting to send event to FB conversions API...');
        await sendPurchaseToFBCoversionAPI(clientid);
      };

      sendEvent();
    }
  }, [clientid]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center sm:static">
        <div className="hero__heading !mb-1 text-5xl tracking-tight opacity-100 sm:!mb-0 sm:text-7xl">
          <Balancer>
            Congratulations! <br />
            <span className="whitespace-pre-wrap font-medium underline decoration-green-500 decoration-4 underline-offset-4">
              You’ve Got a 1-Month Membership
            </span>
          </Balancer>
        </div>

        {clientid && (
          <p className="pt-4 text-lg">on your whatsapp number: {clientid}</p>
        )}

        <h2 className="hero__body !mb-0 py-6 font-normal tracking-tight opacity-100">
          <Balancer>
            Click below to continue generating awesome images!
          </Balancer>
        </h2>
        <ButtonFancy
          text="Go To WhatsApp"
          path="https://wa.me/971505072100"
          className="hero__button min-w-[185px] text-lg font-semibold"
        />
      </Container>
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      />
    </div>
  );
}
