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
      <div className="relative">
        {/* Larger morphing gradient shadow */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-md opacity-75 blur-xl"
          style={{
            top: '-7px',
            left: '-7px',
            right: '-7px',
            bottom: '-7px',
          }}
          animate={{
            background: [
              'linear-gradient(45deg, #f59e0b, #ef4444)',
              'linear-gradient(45deg, #ef4444, #ec4899)',
              'linear-gradient(45deg, #ec4899, #14b8a6)',
              'linear-gradient(45deg, #14b8a6, #0ea5e9)',
              'linear-gradient(45deg, #0ea5e9, #f59e0b)',
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
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
          className="relative overflow-hidden rounded-md"
        >
          <Link
            href="https://wa.me/971505072100"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 text-xl font-semibold text-white transition duration-300 hover:bg-gradient-to-tl hover:ring-1 hover:ring-slate-700/90 hover:ring-offset-2 dark:from-red-600 dark:to-amber-600 dark:hover:ring-slate-300/90"
            onClick={onClick}
          >
            {t('cta')}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TryNowButton;
