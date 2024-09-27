'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { E164Number } from 'libphonenumber-js';
import { AlertOctagonIcon, MessagesSquareIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Balancer from 'react-wrap-balancer';

import { Container } from '@/components/GeneralContainers';
import { PhoneInputShadcnUiPhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DotPattern } from '@/components/ui/magicui/dot';
import { cn } from '@/libs/utils';
import { AppConfig } from '@/utils/appConfig';

export default function CancelSubscriptionPage() {
  const t = useTranslations('CancelSubscription');

  const [phoneNumber, setPhoneNumber] = useState<E164Number>();
  const [loading, setLoading] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState(false);
  const [cancellationTooFrequent, setCancellationTooFrequent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCancellationConfirmationMessageToWhatsApp = async (
    clientid: any,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/waba/sendCancellationMsg?clientid=${clientid.replace('+', '')}`,
      );
      if (!response.ok) throw new Error('Failed to send WhatsApp message');

      const data = await response.json();
      const { cancellationFrequent, cancellationStat } = data;
      console.log(JSON.stringify(data, null, 2));
      setCancellationStatus(cancellationStat);
      setCancellationTooFrequent(cancellationFrequent);
    } catch (err) {
      console.error('Error sending cancellation message:', err);
      setError(
        `Something went wrong, please write to us at email: ${AppConfig.email}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
      <Container className="relative mx-4 flex h-[25rem] w-full flex-col items-center justify-center gap-y-2 rounded-2xl border border-current bg-zinc-50 text-center dark:bg-zinc-900 sm:static sm:mx-0">
        {!cancellationStatus && !cancellationTooFrequent && (
          <>
            <div className="flex w-full flex-row items-center justify-between">
              <div className="!mb-1 w-full text-start text-2xl tracking-tight opacity-100 sm:!mb-0 sm:text-4xl">
                <Balancer>{t('header')}</Balancer>
              </div>
              <div className="flex min-w-fit items-center justify-center whitespace-normal rounded-lg border border-red-500 px-3 py-2 font-semibold tracking-normal text-red-500 sm:px-6 sm:py-4">
                {t('danger')}
              </div>
            </div>
            <hr className="my-2 h-px w-full border-0 bg-black dark:bg-white sm:my-6" />

            <h3 className="!mb-0 py-2 text-sm font-normal opacity-100 sm:py-4 sm:text-base">
              <Balancer>{t('instruction')}</Balancer>
            </h3>

            <Label htmlFor="mobile">{t('label')}</Label>
            <PhoneInputShadcnUiPhoneInput
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />
            <Button
              variant="default"
              className="min-w-[185px] text-sm font-semibold sm:text-base"
              onClick={() =>
                sendCancellationConfirmationMessageToWhatsApp(phoneNumber)
              }
              disabled={loading}
            >
              {loading ? t('button_loading') : t('button_cancel_subscription')}
            </Button>
          </>
        )}
        <AnimatePresence presenceAffectsLayout={false} mode="popLayout">
          {/* Cancellation Success */}
          {cancellationStatus && !cancellationTooFrequent && (
            <motion.div
              key="cancel-success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, type: 'tween' }}
              className="flex w-full flex-col items-center justify-center gap-y-4"
            >
              <MessagesSquareIcon size={96} />
              <p>{t('confirm_message')}</p>
              <Link href="https://wa.me/971505072100">
                <Button
                  variant="default"
                  className="min-w-[185px] text-sm font-semibold sm:text-lg"
                >
                  {t('button_return_to_whatsapp')}
                </Button>
              </Link>
            </motion.div>
          )}

          {!cancellationStatus && cancellationTooFrequent && (
            <motion.div
              key="cancel-frequent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, type: 'tween' }}
              className="flex w-full flex-col items-center justify-center gap-y-4"
            >
              <AlertOctagonIcon size={96} />
              <p>{t('too_frequent')}</p>
              <Link href="https://wa.me/971505072100">
                <Button
                  variant="default"
                  className="min-w-[185px] text-sm font-semibold sm:text-lg"
                >
                  {t('button_return_to_whatsapp')}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              key="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, type: 'tween' }}
              className="flex w-full flex-col items-center justify-center"
            >
              <p className="text-red-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      />
    </div>
  );
}
