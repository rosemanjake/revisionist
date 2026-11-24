import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import InputContextProvider from '@/context/inputcontext';
import { CANONICAL_URL } from '@/utils/constants';

const SITE_TITLE = 'Revisionist | AI-Powered Manuscript Review Service';
const SITE_DESCRIPTION =
  'Revolutionize your writing with Revisionist. Get AI-powered reviews for fiction manuscripts of all sizes. Quick, comprehensive, and affordable feedback to improve your work.';
const SITE_KEYWORDS =
  'Revisionist, AI manuscript review, fiction writing, manuscript feedback, writing improvement, AI writing assistant';
const OG_IMAGE_URL = `${CANONICAL_URL}/revisionist.png`;

const STRUCTURED_DATA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Revisionist',
  applicationCategory: 'WritingApplication',
  offers: {
    '@type': 'Offer',
    price: '5.00',
    priceCurrency: 'USD',
  },
  description:
    'AI-powered manuscript review service for fiction writers. Get comprehensive feedback to improve your writing.',
  operatingSystem: 'Web-based',
  url: CANONICAL_URL,
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <InputContextProvider>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content={SITE_KEYWORDS} />
        <meta name="author" content="Jake Roseman" />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="Revisionist | AI-Powered Manuscript Review"
        />
        <meta
          property="og:description"
          content="Get comprehensive AI-powered reviews for your fiction manuscripts. Fast, affordable, and insightful feedback to elevate your writing."
        />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:site_name" content="Revisionist" />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="720" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Revisionist | AI-Powered Manuscript Review"
        />
        <meta
          name="twitter:description"
          content="Revolutionize your writing with AI-powered manuscript reviews. Fast, comprehensive, and affordable."
        />
        <meta name="twitter:creator" content="@RevisionistAI" />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={CANONICAL_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }}
        />
      </Head>
      <Component {...pageProps} />
    </InputContextProvider>
  );
}
