import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedReport } from '@/store/store-utils';
import type { ValidateEmailResponse } from '@/utils/types';

interface ValidateRequestBody {
  email?: unknown;
  id?: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateEmailResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ isValid: false, message: 'Method Not Allowed' });
    return;
  }

  const body = (req.body ?? {}) as ValidateRequestBody;
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : undefined;

  if (!id) {
    res.status(400).json({ isValid: false, message: 'Report ID is required' });
    return;
  }

  try {
    const result = await getAuthorizedReport(id, email);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error validating report access:', error);
    res.status(500).json({ isValid: false, message: 'Failed to load report' });
  }
}
