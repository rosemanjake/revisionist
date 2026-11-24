import type { GetStaticProps } from 'next';
import { GUMROAD_PRODUCT_URL, SUPPORT_EMAIL } from './constants';
import { loadMarkdownFile, renderTemplate } from './markdown-files';

export interface ContentPageProps {
  content: string;
}

// Server-only: reads `content/<name>.md` at build time.
export function loadPageContent(name: string): string {
  return renderTemplate(loadMarkdownFile('content', name), {
    supportEmail: SUPPORT_EMAIL,
    gumroadProductUrl: GUMROAD_PRODUCT_URL,
  });
}

export function contentPageStaticProps(
  name: string
): GetStaticProps<ContentPageProps> {
  return () => ({ props: { content: loadPageContent(name) } });
}
