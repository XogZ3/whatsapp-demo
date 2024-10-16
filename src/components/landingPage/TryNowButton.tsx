'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const TryNowButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('CTA');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  const onClick = () => {
    sendGAEvent('event', 'conversion', {
      send_to: 'AW-16638273706/MO7nCOGP0dsZEKrR3_09',
      event_category: 'conversion',
    });
  };

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    >
      <motion.div
        animate={{
          backgroundColor: [
            '#f59e0b',
            '#ef4444',
            '#f59e0b',
            '#ec4899',
            '#14b8a6',
            '#0ea5e9',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="rounded-md"
      >
        <Link
          href="https://wa.me/971505072100"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center  px-4 py-2 text-xl font-semibold text-white shadow-md shadow-red-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-amber-500/30 hover:ring-1 hover:ring-slate-700/90 hover:ring-offset-2 dark:from-red-600 dark:to-amber-600 dark:shadow-red-700/30 dark:hover:ring-slate-300/90"
          onClick={onClick}
        >
          {t('cta')}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default TryNowButton;
