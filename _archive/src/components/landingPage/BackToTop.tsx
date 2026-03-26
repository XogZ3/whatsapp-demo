'use client';

import { motion } from 'framer-motion';
import { ArrowUpWideNarrowIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 right-0 z-40 p-4">
      {isVisible && (
        <motion.button
          className="flex size-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg"
          onClick={scrollToTop}
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
          <ArrowUpWideNarrowIcon />
        </motion.button>
      )}
    </div>
  );
};

export default BackToTop;
