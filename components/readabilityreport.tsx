import { useMemo } from 'react';
import styles from '@/styles/ReadabilityReport.module.css';
import type { ReadabilityReportStructure } from '@/utils/types';

const LOWER_GRADES =
  'This text is suitable for lower grade levels. This suggests that the prose is clear, concise, and high quality.';
const MEDIUM_GRADES =
  'This text is fairly easy to read. This suggests that the prose includes some complexity, but is not overwrought.';
const HIGH_GRADES =
  'This text may be difficult to read for some readers. This suggests that the prose is quite complex. You may want to revise with the goal of increasing clarity and concision.';

const DESCRIPTIONS: Record<keyof ReadabilityReportStructure, MetricMetadata> = {
  fleschReadingEase: {
    name: 'Flesch Reading Ease',
    description:
      'This measure assesses the readability of a text based on the average sentence length and the average number of syllables per word. Higher scores (closer to 100) indicate easier readability, while lower scores suggest more difficult text.',
    explanations: {
      high: 'This text is easy to read.',
      medium: 'This text is fairly easy to read.',
      low: 'This text may be difficult to read for some readers.',
    },
  },
  fleschKincaidGrade: {
    name: 'Flesch-Kincaid Grade Level',
    description:
      'This metric converts the Flesch Reading Ease score to a U.S. grade level, making it easier to understand the readability of a text in terms of the education level required to comprehend it.',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
  colemanLiauIndex: {
    name: 'Coleman-Liau Index',
    description:
      'This index calculates readability based on the average number of letters per 100 words and the average number of sentences per 100 words. It approximates the U.S. grade level needed to understand the text.',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
  automatedReadabilityIndex: {
    name: 'Automated Readability Index',
    description:
      'This measure uses the average number of characters per word and the average number of words per sentence to calculate a score that corresponds to a U.S. grade level.',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
  daleChallReadabilityScore: {
    name: 'Dale-Chall Readability Score',
    description:
      'This score is based on the average sentence length and the percentage of difficult words in the text (words not found on a list of 3,000 simple words). It indicates the U.S. grade level required to understand the content.',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
  linsearWriteFormula: {
    name: 'Linsear Write Formula',
    description:
      'This formula calculates readability based on the average number of words per sentence and the percentage of words with three or more syllables. It outputs a U.S. grade level score.',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
  gunningFog: {
    name: 'Gunning Fog Index',
    description:
      'This index estimates the years of formal education needed to understand a text based on the average sentence length and the percentage of complex words (words with three or more syllables).',
    explanations: {
      low: LOWER_GRADES,
      medium: MEDIUM_GRADES,
      high: HIGH_GRADES,
    },
  },
};

const FOG_MAP: Record<number, string> = {
  17: 'College graduate',
  16: 'College senior',
  15: 'College junior',
  14: 'College sophomore',
  13: 'College freshman',
  12: 'High school senior',
  11: 'High school junior',
  10: 'High school sophomore',
  9: 'High school freshman',
  8: 'Eighth grade',
  7: 'Seventh grade',
  6: 'Sixth grade',
};

interface MetricExplanations {
  high: string;
  medium: string;
  low: string;
}

interface MetricMetadata {
  name: string;
  description: string;
  explanations: MetricExplanations;
}

interface ReadabilityReportProps {
  reportString: string;
}

interface ReadabilityScoreProps {
  name: string;
  description: string;
  explanations: MetricExplanations;
  score: string;
  isLast: boolean;
}

function formatOrdinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function daleScoreToNote(scoreString: string): string {
  const score = Number.parseFloat(scoreString);
  if (Number.isNaN(score)) {
    return scoreString;
  }
  if (score < 5.0) {
    return 'Easily understood by an average 4th-grade student or lower';
  }
  if (score < 6.0) {
    return 'Easily understood by an average 5th- or 6th-grade student';
  }
  if (score < 7.0) {
    return 'Easily understood by an average 7th- or 8th-grade student';
  }
  if (score < 8.0) {
    return 'Easily understood by an average 9th- or 10th-grade student';
  }
  if (score < 9.0) {
    return 'Easily understood by an average 11th- or 12th-grade student';
  }
  return 'Easily understood by an average college student';
}

function fleschKincaidScoreToNote(scoreString: string): string {
  const scoreInt = Number.parseInt(scoreString, 10);
  if (Number.isNaN(scoreInt)) {
    return scoreString;
  }
  if (scoreInt <= 0) {
    return 'Kindergarten or lower';
  }
  if (scoreInt < 13) {
    return `${formatOrdinal(scoreInt)} grade level`;
  }
  if (scoreInt === 13) {
    return 'College level';
  }
  return 'Post-college level';
}

function gunningFogScoreToNote(scoreString: string): string {
  const scoreInt = Number.parseInt(scoreString, 10);
  if (Number.isNaN(scoreInt)) {
    return scoreString;
  }
  if (scoreInt < 6) {
    return `${scoreString} - Elementary school`;
  }
  if (scoreInt > 17) {
    return `${scoreString} - Post-graduate`;
  }
  return `${scoreString} - ${FOG_MAP[scoreInt]}`;
}

function getScoreColor(score: string, name: string): string {
  const floatScore = Number.parseFloat(score);
  if (name === 'Flesch Reading Ease') {
    if (floatScore >= 80) return 'green';
    if (floatScore >= 60) return 'orange';
    return 'red';
  }
  if (floatScore <= 6) return 'green';
  if (floatScore <= 10) return 'orange';
  return 'red';
}

function getScoreExplanation(
  score: string,
  name: string,
  explanations: MetricExplanations
): string {
  const floatScore = Number.parseFloat(score);
  if (name === 'Flesch Reading Ease') {
    if (floatScore >= 80) return explanations.high;
    if (floatScore >= 60) return explanations.medium;
    return explanations.low;
  }
  if (floatScore <= 6) return explanations.low;
  if (floatScore <= 10) return explanations.medium;
  return explanations.high;
}

function formatScoreDisplay(score: string, name: string): string {
  if (name === 'Gunning Fog Index') {
    return gunningFogScoreToNote(score);
  }
  if (name === 'Dale-Chall Readability Score') {
    return `${score} - ${daleScoreToNote(score)}`;
  }
  if (name === 'Flesch-Kincaid Grade Level') {
    return fleschKincaidScoreToNote(score);
  }
  return score;
}

function ReadabilityScore({
  name,
  description,
  explanations,
  score,
  isLast,
}: ReadabilityScoreProps): JSX.Element {
  return (
    <div className={`${styles.scoreContainer} ${isLast ? '' : styles.border}`}>
      <h2 className={styles.name}>{name}</h2>
      <div className={styles.score}>
        <strong>Score:</strong>{' '}
        <span style={{ color: getScoreColor(score, name) }}>
          {formatScoreDisplay(score, name)}
        </span>
      </div>
      <div className={styles.description}>
        <strong>Explanation:</strong> {description}
      </div>
      <div className={styles.explanation}>
        <strong>Verdict:</strong> {getScoreExplanation(score, name, explanations)}
      </div>
    </div>
  );
}

export default function ReadabilityReport({ reportString }: ReadabilityReportProps): JSX.Element {
  const report = useMemo<Partial<ReadabilityReportStructure> | null>(() => {
    try {
      return JSON.parse(reportString) as Partial<ReadabilityReportStructure>;
    } catch (error) {
      console.error('Failed to parse readability report:', error);
      return null;
    }
  }, [reportString]);

  if (!report) {
    return (
      <div className={styles.container}>
        <h1>Readability Report</h1>
        <p>Readability metrics are unavailable for this report.</p>
      </div>
    );
  }

  const entries = (
    Object.entries(report) as [keyof ReadabilityReportStructure, string][]
  ).filter(([key]) => key in DESCRIPTIONS);

  return (
    <div className={styles.container}>
      <h1>Readability Report</h1>
      {entries.map(([key, value], index) => {
        const data = DESCRIPTIONS[key];
        return (
          <ReadabilityScore
            key={key}
            name={data.name}
            description={data.description}
            explanations={data.explanations}
            score={value}
            isLast={index === entries.length - 1}
          />
        );
      })}
    </div>
  );
}
