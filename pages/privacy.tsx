import ReactMarkdown from 'react-markdown';
import BasicPage from '@/components/BasicPage';
import {
  contentPageStaticProps,
  type ContentPageProps,
} from '@/utils/page-content';

export const getStaticProps = contentPageStaticProps('privacy');

export default function PrivacyPolicyPage({
  content,
}: ContentPageProps): JSX.Element {
  return (
    <BasicPage>
      <ReactMarkdown>{content}</ReactMarkdown>
    </BasicPage>
  );
}
