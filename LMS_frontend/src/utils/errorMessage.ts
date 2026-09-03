import axios from 'axios';

/**
 * Converts any frontend/backend error object or string into a clear, friendly Arabic error message for students & teachers.
 */
export const toArabicErrorMessage = (error: unknown, fallbackMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً'): string => {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') {
    return translateEnglishText(error) || error;
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const backendMsg = error.response.data?.message;

      if (backendMsg && typeof backendMsg === 'string') {
        const translated = translateEnglishText(backendMsg);
        if (translated) return translated;
      }

      if (status === 401) {
        return 'غير مصرح. البيانات المدخلة غير صحيحة أو انتهت الجلسة.';
      }
      if (status === 403) {
        return 'غير مصرح لك بالوصول لهذه الخدمة.';
      }
      if (status === 404) {
        return 'العنصر أو الخدمة المطلوبة غير موجودة.';
      }
      if (status === 409) {
        return 'البيانات المدخلة موجودة أو مسجلة بالفعل.';
      }
      if (status === 422 || status === 400) {
        if (error.response.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
          const firstErr = error.response.data.errors[0]?.message;
          if (firstErr) return translateEnglishText(firstErr) || firstErr;
        }
        return backendMsg || 'يرجى مراجعة وتدقيق البيانات المدخلة.';
      }
      if (status >= 500) {
        return 'حدث خطأ داخلي في سيرفر المنصة (500). يرجى التأكد من تشغيل الباك إند والإعدادات.';
      }
    } else if (error.request) {
      return 'تعذر الاتصال بالشبكة والسيرفر. يرجى التأكد من تشغيل سيرفر الباك إند والاتصال بالإنترنت.';
    }

    if (error.message) {
      return translateEnglishText(error.message) || fallbackMessage;
    }
  }

  if (error instanceof Error) {
    return translateEnglishText(error.message) || fallbackMessage;
  }

  return fallbackMessage;
};

const translateEnglishText = (text: string): string | null => {
  const lower = text.toLowerCase();

  if (lower.includes('network error')) {
    return 'تعذر الاتصال بالشبكة، يرجى التأكد من اتصال النت وتأكيد تشغيل الباك إند.';
  }
  if (lower.includes('failed with status code 500') || lower.includes('internal server error')) {
    return 'حدث خطأ داخلي في السيرفر أثناء معالجة الطلب (500).';
  }
  if (lower.includes('failed with status code 404') || lower.includes('not found')) {
    return 'العنصر المطلوب غير موجود أو تم حذفه.';
  }
  if (lower.includes('failed with status code 401') || lower.includes('unauthorized')) {
    return 'بيانات الدخول غير صحيحة أو غير مصرح.';
  }
  if (lower.includes('failed with status code 409') || lower.includes('already submitted') || lower.includes('conflict')) {
    return 'لقد قمت بإجراء هذا الإجراء من قبل (مسجل بالفعل).';
  }
  if (lower.includes('only video formats are supported')) {
    return 'يسمح فقط برفع صيغ الفيديو (MP4, WebM, Mov).';
  }
  if (lower.includes('invalid credentials')) {
    return 'بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف وكلمة المرور.';
  }
  if (lower.includes('title is required')) {
    return 'عنوان العنصر مطلوب.';
  }
  if (lower.includes('content url is required') || lower.includes('file key')) {
    return 'ملف الفيديو مطلوب لإنشاء الدرس.';
  }

  return null;
};
