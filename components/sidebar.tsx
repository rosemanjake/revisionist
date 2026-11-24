import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/Sidebar.module.css';
import { openGumroad } from '@/utils/utils';

interface SidebarLinkProps {
  url?: string;
  onClick?: () => void;
  innerText: string;
  delay: number;
}

function Cross(): JSX.Element {
  const { setShouldDisplaySidebar } = useInputContext();

  return (
    <motion.div
      className={styles.cross}
      onClick={() => setShouldDisplaySidebar(false)}
      exit={{ rotate: 360 }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
    >
      <svg
        className="HamSVG AutoMargin"
        width={45}
        height={45}
        fill="var(--offWhite)"
        viewBox="0 0 16 16"
      >
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
      </svg>
    </motion.div>
  );
}

function SideBarLink({ url, onClick, innerText, delay }: SidebarLinkProps): JSX.Element {
  const router = useRouter();
  const { setShouldDisplaySidebar } = useInputContext();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  function handleClick(): void {
    setShouldDisplaySidebar(false);
    if (onClick) {
      onClick();
    } else if (url) {
      void router.push(url);
    }
  }

  return (
    <div
      className={styles.sidebarLinkContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <motion.div
        key={`${innerText}-sidebarLink`}
        initial={{ y: '200px' }}
        animate={{ y: '0%' }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
          delay,
        }}
        className={styles.sidebarLink}
      >
        {innerText}
      </motion.div>

      {isHovered ? (
        <motion.div
          key={`${innerText}-sidebarLink-hover`}
          initial={{ width: '0px' }}
          animate={{ width: '50%' }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
          className={styles.underline}
        />
      ) : (
        <div className={styles.underlineInactive} />
      )}
    </div>
  );
}

export function MenuDot(): JSX.Element {
  const [showMenuText, setShowMenuText] = useState<boolean>(false);
  const { setShouldDisplaySidebar } = useInputContext();

  return (
    <motion.div
      key="hamburger"
      className={styles.hamburger}
      onMouseEnter={() => setShowMenuText(true)}
      onMouseLeave={() => setShowMenuText(false)}
      onClick={() => {
        setShouldDisplaySidebar(true);
        setShowMenuText(false);
      }}
      initial={{ x: '20%' }}
      animate={{ x: '0%' }}
      exit={{ x: '20%' }}
      transition={{
        duration: 0.15,
        ease: 'easeInOut',
        damping: 3,
      }}
    >
      {showMenuText && (
        <motion.div
          className={styles.menuText}
          initial={{ x: '25%', opacity: 0 }}
          animate={{ x: '0%', opacity: 1 }}
          exit={{ x: '25%', opacity: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.15,
            ease: 'easeInOut',
          }}
        >
          Menu
        </motion.div>
      )}
      <div className={styles.circle} />
    </motion.div>
  );
}

export function Sidebar(): JSX.Element {
  return (
    <motion.div
      key="sidebar"
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '100%' }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
      className={styles.sidebar}
    >
      <Cross key="cross" />
      <div className={styles.sidebarLinks}>
        <SideBarLink innerText="Home" delay={0.0} url="/" />
        <SideBarLink innerText="About" delay={0.07} url="/about" />
        <SideBarLink innerText="Examples" delay={0.14} url="/examples" />
        <SideBarLink innerText="FAQs" delay={0.21} url="/faq" />
        <SideBarLink innerText="Get license" delay={0.28} onClick={openGumroad} />
      </div>
      <div className={styles.copyright}>© Jake Roseman, 2024</div>
    </motion.div>
  );
}
