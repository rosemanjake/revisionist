import { motion } from 'framer-motion';

export default function SimpleLoading(): JSX.Element {
  return (
    <motion.div
      className="simpleLoading"
      key="simple-loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    />
  );
}
