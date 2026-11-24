import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyGumroadLicense } from '@/store/license';
import type { VerifyLicenseResponse } from '@/utils/types';

interface LicenseRequestBody {
  type?: unknown;
  key?: unknown;
}

interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyLicenseResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const body = (req.body ?? {}) as LicenseRequestBody;
  const type = typeof body.type === 'string' ? body.type : 'validate';
  const key = typeof body.key === 'string' ? body.key : '';

  if (!key.trim()) {
    res.status(400).json({ message: 'License key is required' });
    return;
  }

  try {
    const incrementUsesCount = type !== 'validate';
    const keyValidationResponse = await verifyGumroadLicense(key, incrementUsesCount);
    res.status(200).json(keyValidationResponse);
  } catch (error) {
    console.error('License verification error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
