'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from 'next-view-transitions';

import { Button } from '@/components/ui/button';
import { headerVariants } from '@/utils/motion';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <section
      id="not-found"
      className="my-4 flex h-screen w-full flex-col items-center gap-y-4 px-4 md:my-6 md:justify-center md:gap-y-10 md:px-6"
    >
      <motion.h2
        whileInView="onscreen"
        initial="offscreen"
        variants={headerVariants}
        className=""
      >
        {t('header')} | {t('paragraph')}
      </motion.h2>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </section>
  );
}
