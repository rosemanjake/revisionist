import { GUMROAD_PRODUCT_URL } from './constants';

export function openGumroad(): void {
  window.open(GUMROAD_PRODUCT_URL, '_blank', 'noopener,noreferrer');
}
