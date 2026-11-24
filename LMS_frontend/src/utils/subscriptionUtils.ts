/**
 * Utilities for tracking student access code verification and 10-day expiration window.
 */

// 10 days in milliseconds: 10 days * 24 hrs * 60 mins * 60 secs * 1000 ms = 864,000,000 ms
export const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

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

export const clearStudentLoginSessions = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('lms_login_session_')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('lms_login_session_')) {
        sessionStorage.removeItem(key);
      }
    });
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

/**
 * Initializes or maintains a login session. Does NOT wipe out an active 10-day verification.
 */
export const startNewLoginSession = (userId: string | undefined | null): string => {
  if (!userId) return '';
  
  // If the 10-day verification has expired, clean up stale verified keys
  if (!isStudentVerified(userId)) {
    clearStudentVerified(userId);
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    localStorage.setItem(`lms_login_session_${userId}`, sessionId);
    sessionStorage.setItem(`lms_login_session_${userId}`, sessionId);
    
    // If the student has an active 10-day verification, bind it to this new session
    const expStr = localStorage.getItem(`lms_code_verified_expires_${userId}`);
    if (expStr) {
      const expTime = new Date(expStr).getTime();
      if (!isNaN(expTime) && expTime > Date.now()) {
        localStorage.setItem(`lms_code_verified_v2_${userId}`, sessionId);
        sessionStorage.setItem(`lms_code_verified_v2_${userId}`, sessionId);
      }
    }
  } catch {
    // Ignore storage errors
  }
  return sessionId;
};

/**
 * Returns true if the student has verified an access code and the 10-day window is still active.
 */
export const isStudentVerified = (userId: string | undefined | null): boolean => {
  if (!userId) return false;

  try {
    // Check expiration timestamp (10 days from activation)
    const expStr =
      localStorage.getItem(`lms_code_verified_expires_${userId}`) ||
      sessionStorage.getItem(`lms_code_verified_expires_${userId}`);

    if (!expStr) {
      return false;
    }

    const expTime = new Date(expStr).getTime();
    if (isNaN(expTime) || expTime <= Date.now()) {
      // 10-day period has passed -> expired
      clearStudentVerified(userId);
      return false;
    }

    // Still within the 10-day validity window
    return true;
  } catch {
    return false;
  }
};

/**
 * Marks the student as verified for 10 days starting from now.
 */
export const setStudentVerified = (
  userId: string | undefined | null,
  backendExpiresAt?: string | Date | null
) => {
  if (!userId) return;
  try {
    let currentSessionId =
      sessionStorage.getItem(`lms_login_session_${userId}`) ||
      localStorage.getItem(`lms_login_session_${userId}`);

    if (!currentSessionId) {
      currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(`lms_login_session_${userId}`, currentSessionId);
      sessionStorage.setItem(`lms_login_session_${userId}`, currentSessionId);
    }

    sessionStorage.setItem(`lms_code_verified_v2_${userId}`, currentSessionId);
    localStorage.setItem(`lms_code_verified_v2_${userId}`, currentSessionId);

    // Calculate 10-day expiration from current time
    const tenDaysFromNowMs = Date.now() + TEN_DAYS_MS;
    let finalExpirationMs = tenDaysFromNowMs;

    if (backendExpiresAt) {
      const backendDate = new Date(backendExpiresAt);
      const backendMs = backendDate.getTime();
      // If backend subscription expires sooner than 10 days, honor the earlier expiration
      if (!isNaN(backendMs) && backendMs < finalExpirationMs) {
        finalExpirationMs = backendMs;
      }
    }

    const expIso = new Date(finalExpirationMs).toISOString();
    localStorage.setItem(`lms_code_verified_expires_${userId}`, expIso);
    sessionStorage.setItem(`lms_code_verified_expires_${userId}`, expIso);
  } catch {
    // Ignore storage errors
  }
};
