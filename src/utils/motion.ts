import { type Variants } from 'framer-motion';

export const headerVariants: Variants = {
  offscreen: {
    y: 100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.25,
    },
  },
};

export const cardVariants = (delay: number) => ({
  offscreen: {
    y: 100,
  },
  onscreen: {
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.1,
      delay: delay * 0.05,
    },
  },
});

const opacityVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export { opacityVariant };
