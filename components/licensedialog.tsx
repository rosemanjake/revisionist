import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/LicenseDialog.module.css';
import {
  CRITIQUE_STYLE_LABELS,
  CritiqueStyle,
  DEFAULT_INPUT_TEXT,
  DEFAULT_LOADING_MESSAGE,
  FREE_WORD_LIMIT,
} from '@/utils/constants';
import { fetchReport } from '@/utils/report-utils';
import { countWords } from '@/utils/text';
import { openGumroad } from '@/utils/utils';
import Button from './button';

const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

enum LicenseState {
  NOT_SUBMITTED,
  INVALID,
  VALID,
}

interface LicenseInputFieldProps {
  licenseState: LicenseState;
  setLicenseState: (value: LicenseState) => void;
  errorMessage: string | null;
  setErrorMessage: (value: string | null) => void;
}

function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function LicenseInputField({
  setLicenseState,
  errorMessage,
  setErrorMessage,
}: LicenseInputFieldProps): JSX.Element {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>('');
  const [emailInputValue, setEmailInputValue] = useState<string>('');
  const [titleInputValue, setTitleInputValue] = useState<string>('');
  const [emailIsInvalid, setEmailIsInvalid] = useState<boolean>(false);
  const [critiqueStyle, setCritiqueStyle] = useState<number>(
    CritiqueStyle.Balanced
  );

  const {
    setShouldDisplayLicenseDialog,
    inputStory,
    wordCount,
    setIsLoading,
    storyInputValue,
    setWordCount,
    setLoadingMessage,
  } = useInputContext();

  function handleLicenseChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setInputValue(event.target.value);
    setLicenseState(LicenseState.NOT_SUBMITTED);
    setErrorMessage(null);
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextEmail = event.target.value;
    setEmailInputValue(nextEmail);
    setErrorMessage(null);
    setEmailIsInvalid(nextEmail.trim().length > 0 && !isEmailValid(nextEmail));
  }

  function handleEmailBlur(): void {
    setEmailIsInvalid(!isEmailValid(emailInputValue));
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTitleInputValue(event.target.value);
    setErrorMessage(null);
  }

  function handleSliderChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setCritiqueStyle(Number.parseInt(event.target.value, 10));
  }

  async function handleSubmit(): Promise<void> {
    const trimmedEmail = emailInputValue.trim();
    const trimmedTitle = titleInputValue.trim();
    const trimmedKey = inputValue.trim();

    if (!isEmailValid(trimmedEmail)) {
      setEmailIsInvalid(true);
      setErrorMessage('Enter a valid email address');
      return;
    }

    if (!trimmedKey && wordCount > FREE_WORD_LIMIT) {
      setErrorMessage('Enter a valid license key');
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage('Enter a title for the piece');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(DEFAULT_LOADING_MESSAGE);

    try {
      const reportData = await fetchReport(
        inputStory,
        trimmedKey || 'none',
        trimmedEmail,
        trimmedTitle,
        critiqueStyle
      );

      if (!reportData.success || !reportData.route) {
        setLicenseState(LicenseState.INVALID);
        if (
          reportData.message === 'Key already used' ||
          reportData.message === 'Key is invalid'
        ) {
          setErrorMessage(reportData.message);
        } else {
          setErrorMessage(
            'Manuscript processing failed. Try again in a minute or two.'
          );
        }
        return;
      }

      setLicenseState(LicenseState.VALID);
      await router.push(reportData.route);
      setShouldDisplayLicenseDialog(false);
      if (DEFAULT_INPUT_TEXT !== storyInputValue) {
        setWordCount(0);
      }
    } catch (error) {
      console.error('Failed to send data to the API:', error);
      setErrorMessage(
        'Manuscript processing failed. Try again in a minute or two.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  const manuscriptMessage =
    wordCount > FREE_WORD_LIMIT
      ? `This manuscript is ${wordCount} words long. Manuscripts over 1,000 words require a license.`
      : `This manuscript is ${wordCount} words long. Manuscripts under 1,000 words do not require a license. The review is free!`;

  return (
    <>
      <div className={styles.inputFieldContainer}>
        <div className={styles.label}>Title:</div>
        <input
          className={styles.inputField}
          type="text"
          value={titleInputValue}
          onChange={handleTitleChange}
        />
      </div>
      <div className={styles.inputFieldContainer}>
        <div className={styles.label}>Email:</div>
        <input
          className={emailIsInvalid ? styles.invalidEmail : styles.validEmail}
          type="email"
          value={emailInputValue}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
        />
      </div>
      {wordCount > FREE_WORD_LIMIT && (
        <div className={styles.inputFieldContainer}>
          <div className={styles.label}>License key:</div>
          <input
            className={styles.inputField}
            type="text"
            value={inputValue}
            onChange={handleLicenseChange}
          />
        </div>
      )}
      <div className={styles.inputFieldContainer}>
        <div className={styles.sliderOuterContainer}>
          <div className={styles.sliderContainer}>
            <span>Gentle</span>
            <input
              type="range"
              min="1"
              max="5"
              value={critiqueStyle}
              onChange={handleSliderChange}
              className={styles.slider}
            />
            <span>Critical</span>
          </div>
          <div>{`Review style: ${CRITIQUE_STYLE_LABELS[critiqueStyle - 1]}`}</div>
        </div>
      </div>
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <div className={styles.manuscriptMessage}>{manuscriptMessage}</div>
      <div className={styles.buttonContainer}>
        <Button text="Submit" onClick={handleSubmit} />
        {wordCount > FREE_WORD_LIMIT && (
          <Button text="Get license" onClick={openGumroad} />
        )}
      </div>
    </>
  );
}

export default function LicenseDialog(): JSX.Element {
  const [licenseState, setLicenseState] = useState<LicenseState>(
    LicenseState.NOT_SUBMITTED
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setShouldDisplayLicenseDialog, storyInputValue, setWordCount } =
    useInputContext();

  function handleClose(): void {
    setShouldDisplayLicenseDialog(false);
    if (!storyInputValue || storyInputValue === DEFAULT_INPUT_TEXT) {
      setWordCount(0);
    } else {
      setWordCount(countWords(storyInputValue));
    }
  }

  return (
    <>
      <div className={styles.blur} />
      <div className={styles.container}>
        <div className={styles.dialogContainer}>
          <div className={styles.dialog}>
            <div className={styles.cross} onClick={handleClose}>
              x
            </div>
            <h3 className={styles.dialogTitle}>Enter details</h3>
            <LicenseInputField
              licenseState={licenseState}
              setLicenseState={setLicenseState}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
