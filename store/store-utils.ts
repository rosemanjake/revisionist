import { randomBytes } from 'crypto';
import { PUBLIC_REVIEW_IDS } from '@/utils/constants';
import type { FullReport, ReportResponse, ValidateEmailResponse } from '@/utils/types';
import { getDb } from './store';

const REPORTS_COLLECTION = 'reports';
const REPORT_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const REPORT_ID_LENGTH = 10;
const MAX_ID_ATTEMPTS = 10;

interface StoredReportDocument {
  md: string;
  email: string;
  title: string;
}

function generateRandomReportId(): string {
  const bytes = randomBytes(REPORT_ID_LENGTH);
  let result = '';
  for (let i = 0; i < REPORT_ID_LENGTH; i++) {
    result += REPORT_ID_ALPHABET[bytes[i] % REPORT_ID_ALPHABET.length];
  }
  return result;
}

function parseStoredReport(rawReport: unknown): FullReport | null {
  if (typeof rawReport !== 'string') {
    return null;
  }

  try {
    return JSON.parse(rawReport) as FullReport;
  } catch (error) {
    console.error('Failed to parse stored report JSON:', error);
    return null;
  }
}

export async function addMarkdown(
  key: string,
  value: string,
  email: string = 'none',
  title: string = ''
): Promise<boolean> {
  try {
    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase() || 'none';
    const payload: StoredReportDocument = {
      md: value,
      email: normalizedEmail,
      title,
    };

    await db.collection(REPORTS_COLLECTION).doc(key).set(payload);
    return true;
  } catch (error) {
    console.error('Error adding document:', error);
    return false;
  }
}

export async function getReport(id: string): Promise<string | null> {
  const db = getDb();
  const docSnap = await db.collection(REPORTS_COLLECTION).doc(id).get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data() as Partial<StoredReportDocument> | undefined;
  return typeof data?.md === 'string' ? data.md : null;
}

export async function getAuthorizedReport(
  id: string,
  email?: string
): Promise<ValidateEmailResponse> {
  const isPublicReview = PUBLIC_REVIEW_IDS.includes(id);
  const trimmedEmail = email?.trim().toLowerCase() ?? '';

  if (!isPublicReview && !trimmedEmail) {
    return {
      isValid: false,
      message: 'Email verification required',
    };
  }

  const db = getDb();
  const docSnap = await db.collection(REPORTS_COLLECTION).doc(id).get();

  if (!docSnap.exists) {
    return {
      isValid: false,
      message: isPublicReview ? 'Report not found' : 'Incorrect email address',
    };
  }

  const data = docSnap.data() as Partial<StoredReportDocument> | undefined;
  const parsedReport = parseStoredReport(data?.md);

  if (!parsedReport) {
    return {
      isValid: false,
      message: 'Report data is unavailable',
    };
  }

  if (isPublicReview) {
    return {
      isValid: true,
      message: 'Public example review',
      report: parsedReport,
    };
  }

  const storedEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!storedEmail || storedEmail !== trimmedEmail) {
    return {
      isValid: false,
      message: 'Incorrect email address',
    };
  }

  return {
    isValid: true,
    message: 'Emails match',
    report: parsedReport,
  };
}

export async function checkIfIdIsDuplicate(id: string): Promise<boolean> {
  const db = getDb();
  const docSnap = await db.collection(REPORTS_COLLECTION).doc(id).get();
  return docSnap.exists;
}

export async function sendToStore(
  content: string,
  email: string,
  title: string
): Promise<ReportResponse> {
  try {
    let firestoreId = generateRandomReportId();
    let attempts = 0;

    while (await checkIfIdIsDuplicate(firestoreId)) {
      attempts++;
      if (attempts >= MAX_ID_ATTEMPTS) {
        throw new Error('Failed to generate unique report ID');
      }
      firestoreId = generateRandomReportId();
    }

    const docIsWritten = await addMarkdown(firestoreId, content, email, title);
    if (!docIsWritten) {
      throw new Error('Document was not written successfully.');
    }

    return {
      success: true,
      message: 'Successfully sent report to store',
      route: `/report/${firestoreId}`,
      content,
    };
  } catch (error) {
    console.error('Failed to send report to store:', error);
    return {
      success: false,
      message: 'Failed to send report to store',
      route: null,
      content: null,
    };
  }
}
