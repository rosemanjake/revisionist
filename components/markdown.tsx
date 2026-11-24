import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import styles from '@/styles/Markdown.module.css';

interface MarkdownProps {
  markdown: string;
}

export default function Markdown({ markdown }: MarkdownProps): JSX.Element {
  const hasContent = Boolean(markdown);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {hasContent && (
          <motion.div
            key="md-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              ease: 'easeInOut',
            }}
          >
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
