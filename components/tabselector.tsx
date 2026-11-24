import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/TabSelector.module.css';
import { REPORT_TABS } from '@/utils/constants';
import type { ReportTab } from '@/utils/types';

interface TabSelectorProps {
  activeTab: ReportTab;
  setActiveTab: (value: ReportTab) => void;
}

interface ReportTabProps {
  tab: ReportTab;
  isActive: boolean;
  setActiveTab: (value: ReportTab) => void;
  index: number;
}

function ReportTabItem({
  tab,
  isActive,
  setActiveTab,
  index,
}: ReportTabProps): JSX.Element {
  let className = isActive ? styles.activeContainer : styles.container;
  if (index === 0) {
    className = `${className} ${styles.firstContainer}`;
  }
  if (index === REPORT_TABS.length - 1) {
    className = `${className} ${styles.lastContainer}`;
  }

  return (
    <div className={className} onClick={() => setActiveTab(tab)}>
      {tab}
    </div>
  );
}

export default function TabSelector({
  activeTab,
  setActiveTab,
}: TabSelectorProps): JSX.Element | null {
  const { isMobile } = useInputContext();

  if (isMobile) {
    return null;
  }

  return (
    <div className={styles.outerContainer}>
      {REPORT_TABS.map((tab, index) => (
        <ReportTabItem
          key={`tabselector-${tab}`}
          tab={tab}
          isActive={tab === activeTab}
          setActiveTab={setActiveTab}
          index={index}
        />
      ))}
    </div>
  );
}
