import { CritiqueStyle } from './constants';
import type { ReportResponse } from './types';

export async function fetchReport(
  inputValue: string,
  licenseKey: string = 'none',
  email: string = 'none',
  title: string | null = null,
  critiqueStyle: number = CritiqueStyle.Balanced
): Promise<ReportResponse> {
  try {
    const response = await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: inputValue,
        licenseKey,
        email,
        title,
        critiqueStyle,
      }),
    });

    const responseData = (await response.json()) as Partial<ReportResponse>;

    if (!response.ok || responseData.success === false) {
      return {
        success: false,
        message: responseData.message ?? 'Failed to generate report',
        route: null,
        content: null,
      };
    }

    return {
      success: true,
      message: 'Route fetched successfully',
      route: responseData.route ?? null,
      content:
        typeof responseData.content === 'string' ? responseData.content : null,
    };
  } catch (error) {
    console.error('Failed to send data to the API:', error);
    return {
      success: false,
      message: 'Network error while generating report',
      route: null,
      content: null,
    };
  }
}
