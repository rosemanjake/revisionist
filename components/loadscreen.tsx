import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/LoadScreen.module.css';
import { DEFAULT_LOADING_MESSAGE } from '@/utils/constants';

const ELLIPSIS_INTERVAL_MS = 500;
const MAX_ELLIPSIS_STATES = 4;

interface LoadScreenProps {
  type: 'local' | 'fullscreen';
}

interface SpinnerProps {
  message?: string | null;
}

function Spinner({ message = null }: SpinnerProps): JSX.Element {
  const [ellipsisCount, setEllipsisCount] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setEllipsisCount((prevCount) => (prevCount + 1) % MAX_ELLIPSIS_STATES);
    }, ELLIPSIS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.spinnerOuterContainer}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}>{`Loading${'.'.repeat(ellipsisCount)}`}</div>
      </div>
      {message && <div className={styles.spinnerMessage}>{message}</div>}
    </div>
  );
}

export default function LoadScreen({ type }: LoadScreenProps): JSX.Element {
  const { loadingMessage } = useInputContext();

  return (
    <motion.div
      className={type === 'local' ? styles.localContainer : styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
    >
      {type !== 'local' && <Spinner message={loadingMessage || DEFAULT_LOADING_MESSAGE} />}
    </motion.div>
  );
}
