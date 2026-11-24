import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AlertMessage from '@/components/alert-message';
import Copyright from '@/components/copyright';
import Gradient from '@/components/gradient';
import InputField from '@/components/inputfield';
import LicenseDialog from '@/components/licensedialog';
import LoadScreen from '@/components/loadscreen';
import { Sidebar } from '@/components/sidebar';
import SimpleLoading from '@/components/simpleloading';
import TopBar from '@/components/topbar';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/Home.module.css';

export default function Home(): JSX.Element {
  const {
    shouldDisplaySidebar,
    shouldDisplayLicenseDialog,
    isLoading,
    alertMessage,
    setWordCount,
    isSimpleLoading,
  } = useInputContext();

  useEffect(() => {
    setWordCount(0);
  }, [setWordCount]);

  return (
    <>
      <AnimatePresence>{isSimpleLoading && <SimpleLoading />}</AnimatePresence>
      <Gradient />
      <AnimatePresence>{isLoading && <LoadScreen type="fullscreen" />}</AnimatePresence>
      <AnimatePresence>{alertMessage !== null && <AlertMessage />}</AnimatePresence>
      <AnimatePresence>{shouldDisplaySidebar && <Sidebar />}</AnimatePresence>
      <div className={styles.container}>
        <div className={styles.box}>
          <TopBar />
          <div className={styles.innerContainer}>
            {shouldDisplayLicenseDialog && <LicenseDialog />}
            <motion.div
              key="home-title"
              initial={{ y: '50px', opacity: 0 }}
              animate={{ y: '0', opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
              className={styles.animateContainer}
            >
              <h1>Revisionist</h1>
            </motion.div>
            <InputField />
            <Copyright />
          </div>
        </div>
      </div>
    </>
  );
}
