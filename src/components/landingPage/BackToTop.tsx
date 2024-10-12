'use client';

import { motion } from 'framer-motion';
import { ArrowUpWideNarrowIcon } from 'lucide-react';
import React from 'react';

import { Container, Section } from '../GeneralContainers';

const BackToTop: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Section
      noYPadding
      className="flex w-full items-center justify-center bg-black dark:bg-white"
    >
      <Container noYPadding className="flex w-full items-center justify-center">
        <motion.button
          className="flex size-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg"
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
      </Container>
    </Section>
  );
};

export default BackToTop;
