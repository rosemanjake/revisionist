import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.title}>Revisionist</div>
        <div className={styles.content}>
          <div className={styles.links}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/terms">Terms and Conditions</Link>
          </div>
          <div>© Jake Roseman, 2024</div>
        </div>
      </div>
    </div>
  );
}
