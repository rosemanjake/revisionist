import type { NextApiRequest, NextApiResponse } from 'next';
import rs from 'text-readability';
import { decrementLicenseUses, verifyGumroadLicense } from '@/store/license';
import { sendToStore } from '@/store/store-utils';
import {
  CritiqueStyle,
  FREE_WORD_LIMIT,
  MAX_WORD_COUNT,
  MIN_WORD_COUNT,
} from '@/utils/constants';
import { sendReportEmail } from '@/utils/email';
import { countWords } from '@/utils/text';
import type {
  FullReport,
  ReadabilityReportStructure,
  ReportResponse,
} from '@/utils/types';
import { generateStructuredReview } from '@/utils/vertex';

export type { FullReport, ReadabilityReportStructure, ReportResponse };

const SYSTEM_PROMPT = `
You are a professional manuscript reviewer.
You are based in London.
You are a sophisticated and well educated man.
You take pride in your work.
Your clients pay a lot of money for your award-winning reviews.
You are discerning and have a keen eye for detail.
You like to provide examples from the manuscript where possible.
Your reviews are entirely apolitical.
Your first priority is always to ensure that you help a client improve their manuscript and make it into the best story possible.
`;

const FRONT_MATTER = `
Take a deep breath and think through this step by step.
`;

const END_MATTER = `
Follow these general instructions:

- In your assessment, make sure to provide detailed answers with specific and actionable feedback.
- Where possible, use lists to communicate your points.
- Aim to be as helpful as possible, and never shy away from criticising work where it needs to be criticised.
- Don't provide any feedback on diversity or equity and don't encourage the user to change the politics of their writing.
- Be sure to compliment the text where possible.
- For testing purposes, you might be asked to review famous public domain works. If you recognise a story, review it as if you were seeing it for the first time. Don't refer to the famous author.
- Follow the general headings of the structure. Don't deviate. However, you can get creative with the list items.
- Aim for 3750 words in total across all sections.

Follow these specific instructions with regards to examples:

- When you make a recommendation, provide explicit examples from the story.
- When giving examples, only quote or paraphrase from the manuscript.
- Do NOT rewrite anything.
- Do NOT provide examples of rewritten sequences.
- Do NOT provide new passages or sentences for the user to add to the text.

A final instruction:

- Return your review as a JSON object with separate fields for overview, plot, characters, prose, and theme. Put each section in its SEPARATE field and do NOT combine multiple sections into one field.
- Format every field as proper multi-line Markdown using real newline characters (\\n\\n) after every heading (# and ##), between paragraphs, and before every bullet list item (- ). Do NOT put headings and body text on the same line.
`;

const STRUCTURE = `
# Overview

Briefly summarize the key elements of the manuscript, including the main plot points, central characters, and overarching themes. This synopsis should provide context for the suggestions and feedback in the rest of the report.

## Overall Impression

- **Initial Thoughts:** Share your initial reactions and impressions of the story, characters, and writing style. Highlight areas that show promise and those that may need improvement.
- **Originality:** Comment on the manuscript's uniqueness within its genre. Suggest ways to make the story stand out and feel fresh.
- **Emotional Impact:** Describe the emotional resonance of the story. Suggest ways to strengthen the emotional connection with readers.

## Suggestions for Improvement

For each section below (Plot, Characters, Prose, Theme), provide a summary of the key strengths and areas for improvement. Offer specific, actionable suggestions and strategies to address the identified issues and build upon the existing strengths of the manuscript. Use examples from the text to illustrate your points. Keep it simple at this point as this is still in the overview.

# Plot

- *Overview*: Provide an overview of your thoughts on the plot and how it could be improved.
- **Pacing:** Identify areas where the pacing could be improved. Offer suggestions for tightening or expanding specific sections to maintain reader engagement.
- **Structure:** Evaluate the plot structure and suggest modifications to enhance the story's impact and effectiveness.
- **Engagement:** Pinpoint moments where reader interest might wane and provide ideas for increasing engagement and stakes.
- **Key Elements:** Offer suggestions for refining the exposition, conflict, rising action, climax, and resolution to maximize their impact on the reader.
- **Subplots & Integration:** Propose ways to better integrate subplots into the main storyline. Suggest strategies for using foreshadowing effectively and resolving any inconsistencies or plot holes.

# Characters

- *Overview*: Provide an overview of your thoughts on the characters and how they could be improved.
- **Depth and Complexity:** Suggest ways to make the characters more well-rounded, believable, and unique. Provide examples of how to add depth to their traits, motivations, and flaws.
- **Consistency:** Point out any inconsistencies in character actions or dialogue and provide ideas for improvement.
- **Major Characters:** For main characters, suggest ways to strengthen their motivations, conflicts, and arcs. Offer ideas for making their transformations more believable and impactful.
- **Relationships & Dynamics:** Propose ways to enhance the chemistry between characters and make their dialogue more natural. Suggest how relationships could better influence character development.
- **Role in Plot and Theme:** Offer suggestions for better integrating characters into the plot and theme. Identify opportunities to strengthen these connections.

# Prose

- *Overview*: Provide an overview of your thoughts on the prose and how it could be improved.
- **Voice:** Provide suggestions for making the authorial voice more distinct, compelling, and appropriate for the genre/audience.
- **Tone:** Offer ideas for ensuring the overall mood is consistent and suitable for the story's themes/genre.
- **Mechanics:** Identify frequent grammar, punctuation, spelling, and formatting errors. Offer correction examples and strategies for improvement.
- **Effectiveness:** Suggest ways to better communicate ideas, evoke emotions, immerse the reader, and create memorable moments through the prose.

# Theme

- *Overview*: Provide an overview of your thoughts on the themes and how they could be improved.
- **Identification:** Clarify the central themes and subthemes if needed.
- **Development:** Offer suggestions for conveying the themes with more nuance and complexity. Provide ideas for expressing themes through characters and plot.
- **Effectiveness & Impact:** Suggest ways to make the themes more thought-provoking, emotionally resonant, and relatable to a wide audience.
- **Presentation:** Offer ideas for exploring the themes with more depth and subtlety. Suggest ways to avoid heavy-handedness or inconsistency in thematic presentation.
`;

const CRITIQUE_STYLE_PROMPTS: Record<CritiqueStyle, string> = {
  [CritiqueStyle.VeryGentle]:
    'The author has requested a very gentle review. Make sure that you emphasise the positive aspects of the manuscript. Praise the work. You should still critique the piece and be helpful, but the overall tone should be positive and uplifting.',
  [CritiqueStyle.Gentle]:
    "The author has requested a gentle review. Please provide a gentle review of the manuscript. While you should point out areas for improvement, focus on constructive feedback and maintain an encouraging tone. Balance critiques with positive observations about the work's strengths.",
  [CritiqueStyle.Balanced]:
    'The author has requested a balanced review. Offer a balanced review of the manuscript. Provide fair and honest feedback, highlighting both the strengths and weaknesses of the work. Maintain a neutral tone, offering constructive criticism alongside positive observations.',
  [CritiqueStyle.Critical]:
    'The author has requested a rigorous and critical review. While you should acknowledge any strengths, focus primarily on identifying areas for improvement. Be direct and specific in your critique, but maintain a professional tone.',
  [CritiqueStyle.VeryCritical]:
    'The author has requested a very rigorous and critical review. Provide a highly critical and rigorous review of the manuscript. The author has requested brutal honesty. Focus intensely on identifying flaws, weaknesses, and areas for improvement. Be direct and uncompromising in your critique, but remain professional.',
};

interface ReportRequestBody {
  content?: unknown;
  licenseKey?: unknown;
  email?: unknown;
  title?: unknown;
  critiqueStyle?: unknown;
}

function getCritiqueStylePrompt(critiqueStyle: number): string {
  return (
    CRITIQUE_STYLE_PROMPTS[critiqueStyle as CritiqueStyle] ??
    CRITIQUE_STYLE_PROMPTS[CritiqueStyle.Balanced]
  );
}

function buildPrompt(
  text: string,
  structure: string,
  title: string | null,
  critiqueStyle: number
): string {
  const titleClause = title
    ? `It is titled ${title}`
    : 'It does not have a known title. Refer to it as the piece, the story, or the manuscript, as appropriate.';

  return `
${FRONT_MATTER}

The following is a fiction manuscript. ${titleClause}:

START OF FICTION MANUSCRIPT

${text}

END OF FICTION MANUSCRIPT

Use the following structure to produce a professional assessment of the piece. Use the voice of an esteemed London-based reviewer who charges a significant sum for assessments. This is a manuscript review. Your goal is to provide detailed and actionable critical feedback that the user can then use to improve the piece of writing they have sent us:

START OF STRUCTURE

${structure}

END OF STRUCTURE

Follow these instructions with regards to general tone in response to the author's wishes. Allow these instructions to override any conflicting instructions when they concern tone:
${getCritiqueStylePrompt(critiqueStyle)}

${END_MATTER}
`;
}

function getReadabilityReport(text: string): string {
  const report: ReadabilityReportStructure = {
    fleschReadingEase: Math.round(rs.fleschReadingEase(text)).toString(),
    fleschKincaidGrade: Math.round(rs.fleschKincaidGrade(text)).toString(),
    colemanLiauIndex: Math.round(rs.colemanLiauIndex(text)).toString(),
    automatedReadabilityIndex: Math.round(rs.automatedReadabilityIndex(text)).toString(),
    daleChallReadabilityScore: Math.round(rs.daleChallReadabilityScore(text)).toString(),
    linsearWriteFormula: Math.round(rs.linsearWriteFormula(text)).toString(),
    gunningFog: Math.round(rs.gunningFog(text)).toString(),
  };

  return JSON.stringify(report);
}

async function getFullReport(
  text: string,
  title: string,
  critiqueStyle: number
): Promise<FullReport | null> {
  const prompt = buildPrompt(text, STRUCTURE, title || null, critiqueStyle);
  const sections = await generateStructuredReview(prompt, SYSTEM_PROMPT);

  if (!sections) {
    return null;
  }

  return {
    ...sections,
    readability: getReadabilityReport(text),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
      route: null,
      content: null,
    });
    return;
  }

  const body = (req.body ?? {}) as ReportRequestBody;
  const text = typeof body.content === 'string' ? body.content : '';
  const licenseKey = typeof body.licenseKey === 'string' ? body.licenseKey : 'none';
  const email = typeof body.email === 'string' ? body.email : 'none';
  const title = typeof body.title === 'string' ? body.title : '';
  const critiqueStyle =
    typeof body.critiqueStyle === 'number' ? body.critiqueStyle : CritiqueStyle.Balanced;

  if (!text.trim()) {
    res.status(400).json({
      success: false,
      message: 'Manuscript content is required.',
      route: null,
      content: null,
    });
    return;
  }

  const wordCount = countWords(text);
  const storyIsLongerThanFreeLimit = wordCount > FREE_WORD_LIMIT;

  if (wordCount < MIN_WORD_COUNT || wordCount > MAX_WORD_COUNT) {
    res.status(400).json({
      success: false,
      message: 'Story is too short or too long.',
      route: null,
      content: null,
    });
    return;
  }

  let licenseConsumed = false;

  if (storyIsLongerThanFreeLimit) {
    const keyValidationResponse = await verifyGumroadLicense(licenseKey, true);

    if (!keyValidationResponse.success) {
      res.status(403).json({
        success: false,
        message: keyValidationResponse.message,
        route: null,
        content: null,
      });
      return;
    }

    licenseConsumed = true;
  }

  try {
    const fullReport = await getFullReport(text, title, critiqueStyle);
    if (!fullReport) {
      if (licenseConsumed) {
        await decrementLicenseUses(licenseKey);
      }
      res.status(500).json({
        success: false,
        message: 'ERROR: Bad response from AI',
        route: null,
        content: null,
      });
      return;
    }

    const fullReportString = JSON.stringify(fullReport);
    const finalData = await sendToStore(fullReportString, email, title);
    if (!finalData.success) {
      throw new Error('Failed to send to store');
    }

    if (finalData.route) {
      const emailResult = await sendReportEmail(email, finalData.route, title);
      if (!emailResult.sent) {
        console.warn('Report saved, but confirmation email was not sent:', emailResult.error);
      }
    }

    res.status(200).json(finalData);
  } catch (error) {
    console.error('Error generating report:', error);
    if (licenseConsumed) {
      await decrementLicenseUses(licenseKey);
    }
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      route: null,
      content: null,
    });
  }
}
