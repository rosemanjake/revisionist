import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import styles from '@/styles/Markdown.module.css';
import { normalizeReportMarkdown } from '@/utils/text';

interface MarkdownProps {
  markdown: string;
}

export default function Markdown({ markdown }: MarkdownProps): JSX.Element {
  const formattedMarkdown = useMemo(() => normalizeReportMarkdown(markdown), [markdown]);
  const hasContent = Boolean(formattedMarkdown);

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
            <ReactMarkdown>{formattedMarkdown}</ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
