import ReactMarkdown from 'react-markdown';
import BasicPage from '@/components/BasicPage';
import {
  contentPageStaticProps,
  type ContentPageProps,
} from '@/utils/page-content';

export const getStaticProps = contentPageStaticProps('examples');

export default function ExamplesPage({
  content,
}: ContentPageProps): JSX.Element {
  return (
    <BasicPage>
      <ReactMarkdown>{content}</ReactMarkdown>
    </BasicPage>
  );
}
