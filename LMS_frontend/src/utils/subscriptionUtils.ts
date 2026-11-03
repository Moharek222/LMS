/**
 * Utilities for tracking student access code verification and expiration per login session.
 */

export const clearStudentVerified = (userId: string | undefined | null) => {
  if (!userId) return;
  try {
    localStorage.removeItem(`lms_code_verified_${userId}`);
    sessionStorage.removeItem(`lms_code_verified_${userId}`);
    localStorage.removeItem(`lms_code_verified_v2_${userId}`);
    sessionStorage.removeItem(`lms_code_verified_v2_${userId}`);
    localStorage.removeItem(`lms_code_verified_expires_${userId}`);
    sessionStorage.removeItem(`lms_code_verified_expires_${userId}`);
  } catch {
    // Ignore storage errors
  }
};

export const clearAllStudentVerifications = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('lms_code_verified_') || key.startsWith('lms_login_session_')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('lms_code_verified_') || key.startsWith('lms_login_session_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage errors
  }
};

export const startNewLoginSession = (userId: string | undefined | null): string => {
  if (!userId) return '';
  clearStudentVerified(userId);
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    localStorage.setItem(`lms_login_session_${userId}`, sessionId);
    sessionStorage.setItem(`lms_login_session_${userId}`, sessionId);
  } catch {
    // Ignore storage errors
  }
  return sessionId;
};

export const isStudentVerified = (userId: string | undefined | null): boolean => {
  if (!userId) return false;

  try {
    // Invalidate legacy v1 key so any old cached mobile browser sessions must re-verify
    if (
      localStorage.getItem(`lms_code_verified_${userId}`) !== null ||
      sessionStorage.getItem(`lms_code_verified_${userId}`) !== null
    ) {
      localStorage.removeItem(`lms_code_verified_${userId}`);
      sessionStorage.removeItem(`lms_code_verified_${userId}`);
    }

    const expStr = localStorage.getItem(`lms_code_verified_expires_${userId}`);
    if (expStr) {
      const expTime = new Date(expStr).getTime();
      if (!isNaN(expTime) && expTime <= Date.now()) {
        clearStudentVerified(userId);
        return false;
      }
    }

    const currentSessionId =
      sessionStorage.getItem(`lms_login_session_${userId}`) ||
      localStorage.getItem(`lms_login_session_${userId}`);

    const verifiedSessionId =
      sessionStorage.getItem(`lms_code_verified_v2_${userId}`) ||
      localStorage.getItem(`lms_code_verified_v2_${userId}`);

    if (!currentSessionId || !verifiedSessionId) {
      return false;
    }

    return currentSessionId === verifiedSessionId;
  } catch {
    return false;
  }
};

export const setStudentVerified = (
  userId: string | undefined | null,
  expiresAt?: string | Date | null
) => {
  if (!userId) return;
  try {
    let currentSessionId =
      sessionStorage.getItem(`lms_login_session_${userId}`) ||
      localStorage.getItem(`lms_login_session_${userId}`);

    if (!currentSessionId) {
      currentSessionId = startNewLoginSession(userId);
    }

    sessionStorage.setItem(`lms_code_verified_v2_${userId}`, currentSessionId);
    localStorage.setItem(`lms_code_verified_v2_${userId}`, currentSessionId);

    if (expiresAt) {
      const expDate = new Date(expiresAt);
      if (!isNaN(expDate.getTime())) {
        localStorage.setItem(`lms_code_verified_expires_${userId}`, expDate.toISOString());
      }
    }
  } catch {
    // Ignore storage errors
  }
};
