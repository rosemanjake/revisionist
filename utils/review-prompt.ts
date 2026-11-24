import { CritiqueStyle } from './constants';
import { loadPrompt, renderPrompt } from './prompts';

const CRITIQUE_STYLE_PROMPT_NAMES: Record<CritiqueStyle, string> = {
  [CritiqueStyle.VeryGentle]: 'critique-styles/very-gentle',
  [CritiqueStyle.Gentle]: 'critique-styles/gentle',
  [CritiqueStyle.Balanced]: 'critique-styles/balanced',
  [CritiqueStyle.Critical]: 'critique-styles/critical',
  [CritiqueStyle.VeryCritical]: 'critique-styles/very-critical',
};

function getCritiqueStylePrompt(critiqueStyle: number): string {
  const name =
    CRITIQUE_STYLE_PROMPT_NAMES[critiqueStyle as CritiqueStyle] ??
    CRITIQUE_STYLE_PROMPT_NAMES[CritiqueStyle.Balanced];
  return loadPrompt(name);
}

function getTitleClause(title: string | null): string {
  return title
    ? renderPrompt(loadPrompt('title-known'), { title })
    : loadPrompt('title-unknown');
}

export function getSystemPrompt(): string {
  return loadPrompt('system');
}

export function buildReviewPrompt(
  manuscript: string,
  title: string | null,
  critiqueStyle: number
): string {
  return renderPrompt(loadPrompt('review'), {
    titleClause: getTitleClause(title),
    manuscript,
    structure: loadPrompt('structure'),
    critiqueStyle: getCritiqueStylePrompt(critiqueStyle),
  });
}
