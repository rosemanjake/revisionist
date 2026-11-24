import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/InputField.module.css';
import {
  DEFAULT_INPUT_TEXT,
  MAX_WORD_COUNT,
  MIN_WORD_COUNT,
} from '@/utils/constants';
import { countWords } from '@/utils/text';
import Button from './button';
import FileUpload from './fileupload';
import WordCounter from './wordcounter';

export const defaultText = DEFAULT_INPUT_TEXT;

export default function InputField(): JSX.Element {
  const {
    setShouldDisplayLicenseDialog,
    wordCount,
    setWordCount,
    setInputStory,
    storyInputValue,
    setStoryInputValue,
    setAlertMessage,
  } = useInputContext();

  useEffect(() => {
    setStoryInputValue(DEFAULT_INPUT_TEXT);
    setInputStory('');
    setWordCount(0);
  }, [setStoryInputValue, setInputStory, setWordCount]);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    const inputValue = event.target.value;
    setStoryInputValue(inputValue);
    setInputStory(inputValue);
    setWordCount(countWords(inputValue));
  }

  function handleFocus(): void {
    if (storyInputValue === DEFAULT_INPUT_TEXT) {
      setStoryInputValue('');
    }
  }

  function handleBlur(): void {
    if (!storyInputValue.trim()) {
      setStoryInputValue(DEFAULT_INPUT_TEXT);
      setInputStory('');
      setWordCount(0);
    }
  }

  function handleSubmit(submittedWordCount: number): void {
    if (submittedWordCount === 0) {
      setAlertMessage(
        'Paste in the text of your manuscript or upload a file and then hit submit.'
      );
      return;
    }

    if (submittedWordCount < MIN_WORD_COUNT) {
      setAlertMessage(
        `Manuscript too short at ${submittedWordCount} words. Minimum length is ${MIN_WORD_COUNT} words.`
      );
      return;
    }

    if (submittedWordCount > MAX_WORD_COUNT) {
      setAlertMessage(
        `Manuscript too long at ${submittedWordCount} words. Maximum length is ${MAX_WORD_COUNT.toLocaleString()} words.`
      );
      return;
    }

    setShouldDisplayLicenseDialog(true);
  }

  return (
    <div className={styles.container}>
      <motion.div
        key="story-textarea-container"
        initial={{ y: '50px', opacity: 0 }}
        animate={{ y: '0', opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          delay: 0.1,
        }}
        className={styles.animateContainer}
      >
        <textarea
          className={styles.storyInput}
          value={storyInputValue}
          onChange={handleChange}
          rows={4}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </motion.div>
      <motion.div
        key="word-counter-container"
        initial={{ y: '50px', opacity: 0 }}
        animate={{ y: '0', opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className={styles.animateContainer}
      >
        <WordCounter />
      </motion.div>
      <motion.div
        key="submit-buttons-container"
        initial={{ y: '50px', opacity: 0 }}
        animate={{ y: '0', opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className={styles.buttonContainer}
      >
        <FileUpload handleSubmit={handleSubmit} />
        <Button text="Submit" onClick={() => handleSubmit(wordCount)} />
      </motion.div>
      <motion.div
        key="examples-hint-container"
        initial={{ y: '50px', opacity: 0 }}
        animate={{ y: '0', opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className={styles.animateContainer}
      >
        <span>
          See our <Link href="/examples">examples</Link> for a sense of what your manuscript
          report will contain.
        </span>
      </motion.div>
    </div>
  );
}
