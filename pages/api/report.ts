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
import { buildReviewPrompt, getSystemPrompt } from '@/utils/review-prompt';
import { countWords } from '@/utils/text';
import type {
  FullReport,
  ReadabilityReportStructure,
  ReportResponse,
} from '@/utils/types';
import { generateStructuredReview } from '@/utils/vertex';

export type { FullReport, ReadabilityReportStructure, ReportResponse };

interface ReportRequestBody {
  content?: unknown;
  licenseKey?: unknown;
  email?: unknown;
  title?: unknown;
  critiqueStyle?: unknown;
}

function getReadabilityReport(text: string): string {
  const report: ReadabilityReportStructure = {
    fleschReadingEase: Math.round(rs.fleschReadingEase(text)).toString(),
    fleschKincaidGrade: Math.round(rs.fleschKincaidGrade(text)).toString(),
    colemanLiauIndex: Math.round(rs.colemanLiauIndex(text)).toString(),
    automatedReadabilityIndex: Math.round(
      rs.automatedReadabilityIndex(text)
    ).toString(),
    daleChallReadabilityScore: Math.round(
      rs.daleChallReadabilityScore(text)
    ).toString(),
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
  const prompt = buildReviewPrompt(text, title || null, critiqueStyle);
  const sections = await generateStructuredReview(prompt, getSystemPrompt());

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
  const licenseKey =
    typeof body.licenseKey === 'string' ? body.licenseKey : 'none';
  const email = typeof body.email === 'string' ? body.email : 'none';
  const title = typeof body.title === 'string' ? body.title : '';
  const critiqueStyle =
    typeof body.critiqueStyle === 'number'
      ? body.critiqueStyle
      : CritiqueStyle.Balanced;

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
        console.warn(
          'Report saved, but confirmation email was not sent:',
          emailResult.error
        );
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
