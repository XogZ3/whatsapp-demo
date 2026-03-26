import { motion } from 'framer-motion';

import { cn } from '@/libs/utils';
import { headerVariants } from '@/utils/motion';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <motion.div
      transition={{ staggerChildren: 0, delayChildren: 0 }}
      viewport={{ once: true }}
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto', className)}
    >
      {children}
    </motion.div>
  );
};

export const SectionHeader = ({ children }: { children?: React.ReactNode }) => {
  return (
    <motion.h2
      whileInView="onscreen"
      initial="offscreen"
      viewport={{ once: true }}
      variants={headerVariants}
    >
      {children}
    </motion.h2>
  );
};
