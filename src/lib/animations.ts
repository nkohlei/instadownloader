import { Variants } from "framer-motion";

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20
    }
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
};

export const slideUp: Variants = {
  hidden: { y: "100%" },
  show: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 40,
      damping: 20
    }
  },
  exit: {
    y: "100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

