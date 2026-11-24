import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/TopBar.module.css';
import { REPORT_TABS } from '@/utils/constants';
import Dropdown from './dropdown';

const SCROLL_DROPDOWN_THRESHOLD_PX = 70;

interface ReportPageTopBarProps {
  context: 'reportPage' | 'basicPage';
}

interface TextButtonProps {
  text: string;
  onClick: () => void;
}

function Logo(): JSX.Element {
  const router = useRouter();

  return (
    <Image
      src="/logo.svg"
      alt="Revisionist logo"
      width={35}
      height={35}
      onClick={() => void router.push('/')}
    />
  );
}

function ReportDropDown(): JSX.Element {
  const { activeTab, setActiveTab } = useInputContext();

  return (
    <motion.div
      key="selector-dropdown"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
      }}
    >
      <Dropdown
        options={REPORT_TABS}
        onChange={setActiveTab}
        defaultValue={REPORT_TABS[0]}
        activeOption={activeTab}
      />
    </motion.div>
  );
}

function TextButton({ text, onClick }: TextButtonProps): JSX.Element {
  return (
    <div onClick={onClick} className={styles.textButton}>
      {text}
    </div>
  );
}

function TextButtonRow(): JSX.Element {
  const router = useRouter();
  const { setShouldDisplaySidebar, isMobile } = useInputContext();

  return (
    <div className={styles.textButtonRow}>
      {!isMobile && (
        <TextButton text="About" onClick={() => void router.push('/about')} />
      )}
      <TextButton text="Menu" onClick={() => setShouldDisplaySidebar(true)} />
    </div>
  );
}

export function ReportPageTopBar({
  context,
}: ReportPageTopBarProps): JSX.Element {
  const { isMobile } = useInputContext();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    function handleScroll(): void {
      if (isMobile) {
        setShowDropdown(true);
      } else {
        setShowDropdown(window.scrollY > SCROLL_DROPDOWN_THRESHOLD_PX);
      }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return (
    <div className={styles.narrowOuterContainer}>
      <div className={styles.narrowContainer}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <AnimatePresence>
          {context === 'reportPage' && showDropdown && <ReportDropDown />}
        </AnimatePresence>
        <TextButtonRow />
      </div>
    </div>
  );
}

export default function TopBar(): JSX.Element {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <TextButtonRow />
      </div>
    </div>
  );
}
