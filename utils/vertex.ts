import { GoogleGenAI, ThinkingLevel, Type, type Schema } from '@google/genai';
import { loadPrompt } from './prompts';
import { normalizeReportMarkdown } from './text';
import type { ReviewSections } from './types';

const DEFAULT_VERTEX_LOCATION = 'global';
const DEFAULT_VERTEX_MODEL = 'gemini-4-neon';
const MAX_OUTPUT_TOKENS = 32768;

const MARKDOWN_FORMAT_NOTE = loadPrompt('schema-markdown-format');

function describeField(field: string): string {
  return `${loadPrompt(`schema-fields/${field}`)} ${MARKDOWN_FORMAT_NOTE}`;
}

const REVIEW_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.STRING,
      description: describeField('overview'),
    },
    plot: {
      type: Type.STRING,
      description: describeField('plot'),
    },
    characters: {
      type: Type.STRING,
      description: describeField('characters'),
    },
    prose: {
      type: Type.STRING,
      description: describeField('prose'),
    },
    theme: {
      type: Type.STRING,
      description: describeField('theme'),
    },
  },
  required: ['overview', 'plot', 'characters', 'prose', 'theme'],
};

let cachedClient: GoogleGenAI | null = null;

function getVertexClient(): GoogleGenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  if (!project) {
    throw new Error(
      'GOOGLE_CLOUD_PROJECT environment variable is required for Vertex AI.'
    );
  }

  const location =
    process.env.GOOGLE_CLOUD_LOCATION?.trim() || DEFAULT_VERTEX_LOCATION;

  cachedClient = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  return cachedClient;
}

function isValidReviewSections(value: unknown): value is ReviewSections {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.overview === 'string' &&
    record.overview.trim().length > 0 &&
    typeof record.plot === 'string' &&
    record.plot.trim().length > 0 &&
    typeof record.characters === 'string' &&
    record.characters.trim().length > 0 &&
    typeof record.prose === 'string' &&
    record.prose.trim().length > 0 &&
    typeof record.theme === 'string' &&
    record.theme.trim().length > 0
  );
}

export async function generateStructuredReview(
  prompt: string,
  systemInstruction: string
): Promise<ReviewSections | null> {
  const client = getVertexClient();
  const model = process.env.VERTEX_AI_MODEL?.trim() || DEFAULT_VERTEX_MODEL;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: REVIEW_RESPONSE_SCHEMA,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MEDIUM,
      },
    },
  });

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.error(
      'Vertex AI response was truncated due to maxOutputTokens limit.'
    );
  }

  const rawText = response.text;
  if (!rawText) {
    console.error('Empty text returned from Vertex AI.');
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawText);
    if (!isValidReviewSections(parsed)) {
      console.error(
        'Missing or empty required fields in Vertex AI structured response.'
      );
      return null;
    }

    return {
      overview: normalizeReportMarkdown(parsed.overview),
      plot: normalizeReportMarkdown(parsed.plot),
      characters: normalizeReportMarkdown(parsed.characters),
      prose: normalizeReportMarkdown(parsed.prose),
      theme: normalizeReportMarkdown(parsed.theme),
    };
  } catch (error) {
    console.error('Failed to parse JSON response from Vertex AI:', error);
    return null;
  }
}
