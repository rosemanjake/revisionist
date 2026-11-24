import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/WordCounter.module.css';
import { MAX_WORD_COUNT } from '@/utils/constants';
import { countWords } from '@/utils/text';

export { countWords };

export default function WordCounter(): JSX.Element {
  const { wordCount } = useInputContext();

  return (
    <div className={wordCount >= MAX_WORD_COUNT ? styles.overLimitContainer : styles.container}>
      {`${wordCount.toLocaleString()} / ${MAX_WORD_COUNT.toLocaleString()} words`}
    </div>
  );
}
