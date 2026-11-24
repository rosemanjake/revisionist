export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'roseman.jake@gmail.com';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://revisionist.ai';
export const CANONICAL_URL =
  process.env.NEXT_PUBLIC_CANONICAL_URL ?? 'https://www.revisionistai.com';
export const GUMROAD_PRODUCT_URL =
  process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ??
  'https://8485562534997.gumroad.com/l/revisionist';

export const FREE_WORD_LIMIT = 1000;
export const MIN_WORD_COUNT = 150;
export const MAX_WORD_COUNT = 100000;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const DEFAULT_INPUT_TEXT =
  'Paste in your short story, novella, or novel, and hit submit for a thorough manuscript review...';
export const DEFAULT_LOADING_MESSAGE =
  'Revisionist is processing your manuscript. This may take several minutes.';

export const PUBLIC_REVIEW_IDS: readonly string[] = [
  'fsMXGvHS8g',
  'Zg9dYkSBWA',
  'wBHkknwVQL',
];

export const ALLOWED_UPLOAD_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/epub+zip',
];

export const REPORT_TABS = [
  'overview',
  'characters',
  'plot',
  'theme',
  'prose',
  'readability',
] as const;

export const CRITIQUE_STYLE_LABELS: readonly string[] = [
  'Very gentle',
  'Gentle',
  'Balanced',
  'Critical',
  'Very critical',
];

export enum CritiqueStyle {
  VeryGentle = 1,
  Gentle = 2,
  Balanced = 3,
  Critical = 4,
  VeryCritical = 5,
}
