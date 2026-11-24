import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/BasicPage.module.css';
import Footer from './footer';
import { Sidebar } from './sidebar';
import { ReportPageTopBar } from './topbar';

interface BasicPageProps {
  children: ReactNode;
}

export default function BasicPage({ children }: BasicPageProps): JSX.Element {
  const { shouldDisplaySidebar, setShouldDisplaySidebar } = useInputContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setShouldDisplaySidebar(false);

    return () => {
      setShouldDisplaySidebar(false);
    };
  }, [setShouldDisplaySidebar]);

  return (
    <>
      <AnimatePresence>{shouldDisplaySidebar && <Sidebar />}</AnimatePresence>
      <ReportPageTopBar context="basicPage" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={styles.container}
        >
          <div className={styles.innerContainer}>{children}</div>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}
