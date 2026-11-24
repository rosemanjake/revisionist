const KNOWN_SECTION_HEADINGS =
  'Overview|Overall Impression|Suggestions for Improvement|Plot|Characters|Prose|Theme';

const INLINE_HEADING_REGEX = new RegExp(
  `(^|\\s)(#{1,3}\\s+(?:${KNOWN_SECTION_HEADINGS}))(?=\\s|$)`,
  'g'
);

const INLINE_LIST_ITEM_REGEX = /\s+(-\s+(?:\*\*[^*\n]+?\*\*|\*[^*\n]+?\*):?)/g;

export function countWords(text: string): number {
  if (!text) {
    return 0;
  }

  let count = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isWhitespace =
      code === 32 ||
      code === 9 ||
      code === 10 ||
      code === 13 ||
      code === 11 ||
      code === 12 ||
      code === 160;

    if (isWhitespace) {
      inWord = false;
    } else if (!inWord) {
      count++;
      inWord = true;
    }
  }

  return count;
}

export function normalizeReportMarkdown(markdown: string): string {
  if (!markdown) {
    return '';
  }

  let normalized = markdown;

  if (!normalized.includes('\n') && normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }

  if (normalized.includes('\n')) {
    return normalized;
  }

  // Recover structure if an LLM flattened a Markdown section onto a single
  // line.
  normalized = normalized.replace(
    INLINE_HEADING_REGEX,
    (_match, prefix: string, heading: string) => {
      const leading = prefix ? '\n\n' : '';
      return `${leading}${heading}\n\n`;
    }
  );

  normalized = normalized.replace(INLINE_LIST_ITEM_REGEX, '\n\n$1');

  return normalized.replace(/\n{3,}/g, '\n\n').trim();
}
