/**
 * Helper utilities for Access Codes to accurately compute active/expired status
 * based on both backend status field and real-time expiration date (expiresAt).
 */

export interface AccessCodeLike {
  status?: string;
  expiresAt?: string | Date | null;
}

/**
 * Checks whether an access code is expired.
 * A code is considered expired if its status is 'expired' OR its expiresAt timestamp has passed.
 */
export const isAccessCodeExpired = (code: AccessCodeLike | null | undefined): boolean => {
  if (!code) return true;
  if ((code.status || '').toLowerCase() === 'expired') return true;
  if (code.expiresAt) {
    const exp = new Date(code.expiresAt);
    const expTime = exp.getTime();
    if (!isNaN(expTime)) {
      return expTime <= Date.now();
    }
  }
  return false;
};

/**
 * Returns Arabic status text: 'منتهي' or 'نشط'
 */
export const getAccessCodeStatusText = (code: AccessCodeLike | null | undefined): 'منتهي' | 'نشط' => {
  return isAccessCodeExpired(code) ? 'منتهي' : 'نشط';
};
