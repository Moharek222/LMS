/**
 * Utilities for tracking student access code verification and expiration in the browser.
 */

export const isStudentVerified = (userId: string | undefined | null): boolean => {
  if (!userId) return false;

  const expStr = localStorage.getItem(`lms_code_verified_expires_${userId}`);
  if (expStr) {
    const expTime = new Date(expStr).getTime();
    if (!isNaN(expTime) && expTime <= Date.now()) {
      localStorage.removeItem(`lms_code_verified_${userId}`);
      sessionStorage.removeItem(`lms_code_verified_${userId}`);
      localStorage.removeItem(`lms_code_verified_expires_${userId}`);
      return false;
    }
  }

  return (
    sessionStorage.getItem(`lms_code_verified_${userId}`) === 'true' ||
    localStorage.getItem(`lms_code_verified_${userId}`) === 'true'
  );
};

export const setStudentVerified = (userId: string | undefined | null, expiresAt?: string | Date | null) => {
  if (!userId) return;
  sessionStorage.setItem(`lms_code_verified_${userId}`, 'true');
  localStorage.setItem(`lms_code_verified_${userId}`, 'true');
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    if (!isNaN(expDate.getTime())) {
      localStorage.setItem(`lms_code_verified_expires_${userId}`, expDate.toISOString());
    }
  }
};

export const clearStudentVerified = (userId: string | undefined | null) => {
  if (!userId) return;
  localStorage.removeItem(`lms_code_verified_${userId}`);
  sessionStorage.removeItem(`lms_code_verified_${userId}`);
  localStorage.removeItem(`lms_code_verified_expires_${userId}`);
};
