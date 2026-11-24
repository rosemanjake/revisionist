import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Button from '@/components/button';
import Footer from '@/components/footer';
import Markdown from '@/components/markdown';
import ReadabilityReport from '@/components/readabilityreport';
import { Sidebar } from '@/components/sidebar';
import SimpleLoading from '@/components/simpleloading';
import TabSelector from '@/components/tabselector';
import { ReportPageTopBar } from '@/components/topbar';
import { useInputContext } from '@/context/inputcontext';
import dialogStyles from '@/styles/AlertMessage.module.css';
import styles from '@/styles/ReportPage.module.css';
import type { FullReport, ValidateEmailResponse } from '@/utils/types';

interface EmailFormProps {
  onSubmit: () => void;
  setInputValue: (value: string) => void;
  errorMessage: string | null;
}

function EmailForm({ onSubmit, setInputValue, errorMessage }: EmailFormProps): JSX.Element {
  function handleInputValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(event.target.value);
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <>
      <div className={dialogStyles.blur} />
      <div className={dialogStyles.container}>
        <AnimatePresence>
          <motion.form
            key="email-validation-dialog"
            initial={{ y: '20px', opacity: 0 }}
            animate={{ y: '0', opacity: 1 }}
            exit={{ y: '20px', opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={dialogStyles.dialog}
            style={{ height: '300px' }}
            onSubmit={handleFormSubmit}
          >
            <div>Enter the email you used to request this manuscript review.</div>
            <input type="email" onChange={handleInputValueChange} autoFocus />
            {errorMessage && <div>{errorMessage}</div>}
            <Button text="OK" onClick={onSubmit} />
          </motion.form>
        </AnimatePresence>
      </div>
    </>
  );
}

export default function ReportPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const reportId = typeof id === 'string' ? id : undefined;

  const {
    activeTab,
    setActiveTab,
    shouldDisplaySidebar,
    setShouldDisplaySidebar,
    isSimpleLoading,
    setIsSimpleLoading,
  } = useInputContext();

  const [report, setReport] = useState<FullReport | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shouldDisplayEmailForm, setShouldDisplayEmailForm] = useState<boolean>(false);

  useEffect(() => {
    setShouldDisplaySidebar(false);
    setActiveTab('overview');

    return () => {
      setShouldDisplaySidebar(false);
    };
  }, [setShouldDisplaySidebar, setActiveTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    if (!reportId) {
      return;
    }

    let isCancelled = false;
    setReport(null);
    setErrorMessage(null);

    async function checkIfPublicReview(): Promise<void> {
      try {
        const response = await fetch('/api/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: reportId }),
        });

        const data = (await response.json()) as ValidateEmailResponse;
        if (isCancelled) {
          return;
        }

        if (data.isValid && data.report) {
          setReport(data.report);
          setShouldDisplayEmailForm(false);
        } else {
          setShouldDisplayEmailForm(true);
        }
      } catch (error) {
        console.error('Error checking report access:', error);
        if (!isCancelled) {
          setShouldDisplayEmailForm(true);
        }
      }
    }

    void checkIfPublicReview();

    return () => {
      isCancelled = true;
    };
  }, [reportId]);

  async function testEmail(): Promise<void> {
    if (!reportId) {
      return;
    }

    if (!inputValue.trim()) {
      setErrorMessage('Enter a valid email address');
      return;
    }

    setIsSimpleLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputValue,
          id: reportId,
        }),
      });

      const data = (await response.json()) as ValidateEmailResponse;

      if (!data.isValid || !data.report) {
        setErrorMessage(data.message);
        return;
      }

      setReport(data.report);
      setShouldDisplayEmailForm(false);
    } catch (error) {
      console.error('Error validating email:', error);
      setErrorMessage('Failed to validate email. Please try again.');
    } finally {
      setIsSimpleLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>{isSimpleLoading && <SimpleLoading />}</AnimatePresence>
      <AnimatePresence>{shouldDisplaySidebar && <Sidebar />}</AnimatePresence>
      <div className={styles.outerContainer}>
        <ReportPageTopBar context="reportPage" />
        {report && (
          <>
            <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className={styles.container}>
              {activeTab === 'readability' ? (
                <ReadabilityReport reportString={report.readability} />
              ) : (
                <Markdown markdown={report[activeTab]} />
              )}
            </div>
          </>
        )}
        {shouldDisplayEmailForm && (
          <EmailForm
            onSubmit={testEmail}
            setInputValue={setInputValue}
            errorMessage={errorMessage}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
