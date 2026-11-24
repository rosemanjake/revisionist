import type { VerifyLicenseResponse } from '@/utils/types';

const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';
const GUMROAD_DECREMENT_URL = 'https://api.gumroad.com/v2/licenses/decrement_uses_count';

interface GumroadVerifyApiResponse {
  success?: boolean;
  uses?: number;
  message?: string;
}

export function getGumroadProductId(): string | null {
  return process.env.GUMROAD_PRODUCT_ID?.trim() || null;
}

export async function verifyGumroadLicense(
  licenseKey: string,
  incrementUsesCount: boolean = true,
  productIdOverride?: string
): Promise<VerifyLicenseResponse> {
  const trimmedKey = licenseKey?.trim() ?? '';

  if (!trimmedKey || trimmedKey === 'none') {
    return { success: false, message: 'No key provided', licenseKey: trimmedKey };
  }

  const masterKey = process.env.MASTER_LICENSE_KEY?.trim();
  if (masterKey && trimmedKey === masterKey) {
    return { success: true, message: 'Key is valid', licenseKey: trimmedKey };
  }

  const productId = productIdOverride?.trim() || getGumroadProductId();
  if (!productId) {
    console.error('GUMROAD_PRODUCT_ID environment variable is not configured.');
    return {
      success: false,
      message: 'License verification is not configured',
      licenseKey: trimmedKey,
    };
  }

  try {
    const body = new URLSearchParams({
      product_id: productId,
      license_key: trimmedKey,
      increment_uses_count: incrementUsesCount ? 'true' : 'false',
    });

    const response = await fetch(GUMROAD_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = (await response.json()) as GumroadVerifyApiResponse;

    if (data.success === true) {
      const maxAllowedUses = incrementUsesCount ? 1 : 0;
      if (typeof data.uses === 'number' && data.uses > maxAllowedUses) {
        return { success: false, message: 'Key already used', licenseKey: trimmedKey };
      }
      return { success: true, message: 'Key is valid', licenseKey: trimmedKey };
    }

    return { success: false, message: 'Key is invalid', licenseKey: trimmedKey };
  } catch (error) {
    console.error('Error verifying Gumroad license:', error);
    return {
      success: false,
      message: 'Verifying license key failed',
      licenseKey: trimmedKey,
    };
  }
}

export async function decrementLicenseUses(
  licenseKey: string,
  productIdOverride?: string
): Promise<boolean> {
  const trimmedKey = licenseKey?.trim() ?? '';
  const masterKey = process.env.MASTER_LICENSE_KEY?.trim();

  if (!trimmedKey || trimmedKey === 'none' || (masterKey && trimmedKey === masterKey)) {
    return false;
  }

  const productId = productIdOverride?.trim() || getGumroadProductId();
  const accessToken = process.env.GUMROAD_ACCESS_TOKEN?.trim();
  if (!productId || !accessToken) {
    console.error(
      'GUMROAD_PRODUCT_ID or GUMROAD_ACCESS_TOKEN environment variable is not configured.'
    );
    return false;
  }

  try {
    const response = await fetch(GUMROAD_DECREMENT_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: accessToken,
        product_id: productId,
        license_key: trimmedKey,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error decrementing license uses:', error);
    return false;
  }
}

export default verifyGumroadLicense;
