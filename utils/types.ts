import { REPORT_TABS } from './constants';

export type ReportTab = (typeof REPORT_TABS)[number];

export interface ReportResponse {
  success: boolean;
  message: string | null;
  route: string | null;
  content: string | null;
}

export interface ReviewSections {
  overview: string;
  plot: string;
  characters: string;
  prose: string;
  theme: string;
}

export interface FullReport extends ReviewSections {
  readability: string;
}

export interface ReadabilityReportStructure {
  fleschReadingEase: string;
  fleschKincaidGrade: string;
  colemanLiauIndex: string;
  automatedReadabilityIndex: string;
  daleChallReadabilityScore: string;
  linsearWriteFormula: string;
  gunningFog: string;
}

export interface VerifyLicenseResponse {
  success: boolean;
  message: string | null;
  licenseKey: string;
}

export interface ValidateEmailResponse {
  isValid: boolean;
  message: string;
  report?: FullReport;
}

export interface UploadResponse {
  text?: string;
  error?: string;
}
