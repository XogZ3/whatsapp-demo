'use client';

import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // if the user scrolls down, show the button
      setIsVisible(window.scrollY > 500);
    };
    // listen for scroll events
    window.addEventListener('scroll', toggleVisibility);

    // clear the listener on component unmount
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // handles the animation when scrolling to the top
  const scrollToTop = () => {
    if (isVisible) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.button
      type="button"
      aria-label="Scroll to top"
      className={`fixed bottom-10 z-30 hidden rounded-full p-2 outline-none transition-opacity duration-200 md:block ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={scrollToTop}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -5, 0],
        transition: { duration: 1, repeat: Infinity },
      }}
      style={{
        left: '50%',
        transform: 'translateX(50%)',
        margin: 0,
        padding: 0,
      }}
    >
      <div className="rounded-full bg-slate-500/30 dark:bg-white/30">
        <ChevronUp size={30} />
      </div>
    </motion.button>
  );
};

export default ScrollToTopButton;
