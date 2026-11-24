import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/AlertMessage.module.css';
import Button from './button';

export default function AlertMessage(): JSX.Element {
  const { alertMessage, setAlertMessage } = useInputContext();
  const [shouldDisplayAlert, setShouldDisplayAlert] = useState<boolean>(
    alertMessage !== null
  );

  return (
    <>
      <div className={styles.blur} />
      <div className={styles.container}>
        <AnimatePresence onExitComplete={() => setAlertMessage(null)}>
          {shouldDisplayAlert && (
            <motion.div
              key="alertmessage"
              initial={{ y: '20px', opacity: 0 }}
              animate={{ y: '0', opacity: 1 }}
              exit={{ y: '20px', opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={styles.dialog}
            >
              <div>{alertMessage}</div>
              <Button text="OK" onClick={() => setShouldDisplayAlert(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
