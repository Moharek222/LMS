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
      const responseData = error.response.data;
      const backendMsg = responseData?.message;

      // Extract first error from express-validator array
      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const firstErr = responseData.errors[0]?.msg || responseData.errors[0]?.message;
        if (typeof firstErr === 'string') {
          const translated = translateEnglishText(firstErr);
          if (translated) return translated;
          return firstErr;
        }
      }

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
        return (backendMsg && typeof backendMsg === 'string' ? translateEnglishText(backendMsg) || backendMsg : null) || 'يرجى مراجعة وتدقيق البيانات المدخلة.';
      }
      if (status >= 500) {
        return 'تعذر معالجة الطلب حالياً بسبب خطأ مؤقت في السيرفر. يرجى المحاولة بعد قليل أو التواصل مع الدعم.';
      }
    } else if (error.request) {
      return 'تعذر الاتصال بسيرفر المنصة. يرجى التأكد من الاتصال بالإنترنت .';
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
    return 'لا يمكنك إجراء الامتحان أكثر من مرة (تم تسليم الامتحان سابقاً).';
  }
  if (lower.includes('only video formats are supported')) {
    return 'يسمح فقط برفع صيغ الفيديو (MP4, WebM, Mov).';
  }
  if (lower.includes('invalid credentials') || lower.includes('invalid email or password') || lower.includes('invalid phone number or password')) {
    return 'بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف/البريد وكلمة المرور.';
  }
  if (lower.includes('account has been deactivated')) {
    return 'تم تعطيل هذا الحساب. يرجى التواصل مع المعلم أو الإدارة.';
  }
  if (lower.includes('phone number is already registered')) {
    return 'رقم الهاتف مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.';
  }
  if (lower.includes('email is already registered')) {
    return 'البريد الإلكتروني مسجل بالفعل بالحسابات، يرجى استخدام بريد آخر.';
  }
  if (lower.includes('phone number must be 11 digits')) {
    return 'رقم الهاتف يجب أن يتكون من 11 رقماً.';
  }
  if (lower.includes('phone number is already in use')) {
    return 'رقم الهاتف مستخدم بالفعل بواسطة حساب طالب آخر.';
  }
  if (lower.includes('at least 3 characters long')) {
    return 'يجب أن يكون الاسم 3 أحرف على الأقل.';
  }
  if (lower.includes('please provide at least one field')) {
    return 'يرجى تعديل حقل واحد على الأقل قبل الحفظ.';
  }
  if (lower.includes('already has an active subscription')) {
    return 'الطالب لديه اشتراك مفعل بالفعل.';
  }
  if (lower.includes('do not have an active subscription')) {
    return 'ليس لديك اشتراك نشط. يرجى تفعيل كود الوصول أولاً للمتابعة.';
  }
  if (lower.includes('your subscription has expired')) {
    return 'انتهت صلاحية اشتراكك. يرجى تفعيل كود جديد للمتابعة.';
  }
  if (lower.includes('invalid access code')) {
    return 'كود الوصول المدخل غير صحيح.';
  }
  if (lower.includes('access code has expired')) {
    return 'كود الوصول منتهي الصلاحية.';
  }
  if (lower.includes('code collision occurred')) {
    return 'حدث تداخل أثناء التوليد، يرجى إعادة المحاولة.';
  }
  if (lower.includes('attendance record not found')) {
    return 'سجل الحضور والغياب غير موجود.';
  }
  if (lower.includes('invalid attendance id format')) {
    return 'معرف كشف الحضور غير صحيح.';
  }
  if (lower.includes('course not found')) {
    return 'الكورس المطلوب غير موجود.';
  }
  if (lower.includes('invalid course id format')) {
    return 'معرف الكورس غير صحيح.';
  }
  if (lower.includes('exam not found') || lower.includes('no exam found')) {
    return 'الامتحان المطلوب غير موجود أو تم حذفه.';
  }
  if (lower.includes('invalid exam id format')) {
    return 'معرف الامتحان غير صحيح.';
  }
  if (lower.includes('must have a valid points value')) {
    return 'درجة السؤال يجب أن تكون رقمية وفي حدود 1 على الأقل.';
  }
  if (lower.includes('must have an options array')) {
    return 'أسئلة الاختيار من متعدد يجب أن تحتوي على خيارين على الأقل.';
  }
  if (lower.includes('answer must exactly match one of its options') || lower.includes('must be exactly one of the provided options')) {
    return 'الإجابة الصحيحة يجب أن تطابق تماماً أحد الخيارات المتاحة للسؤال.';
  }
  if (lower.includes('no image provided')) {
    return 'يرجى اختيار صورة مرفقة للرفع.';
  }
  if (lower.includes('already submitted this exam') || lower.includes('already submitted this quiz') || lower.includes('already submitted')) {
    return 'لا يمكنك إجراء الامتحان أكثر من مرة (تم تسليم الامتحان سابقاً).';
  }
  if (lower.includes('quiz not found or not active')) {
    return 'الاختبار غير موجود أو غير نشط حالياً.';
  }
  if (lower.includes('you must submit at least one answer')) {
    return 'يجب تقديم إجابة واحدة على الأقل للاختبار.';
  }
  if (lower.includes('submission not found')) {
    return 'سجل تسليم الاختبار/الامتحان غير موجود.';
  }
  if (lower.includes('invalid submission id format') || lower.includes('invalid quiz submission id format')) {
    return 'معرف تسليم الاختبار/الامتحان غير صحيح.';
  }
  if (lower.includes('group has students and cannot be deleted') || lower.includes('group has students')) {
    return 'لا يمكن حذف هذه المجموعة لأنها تحتوي على طلاب مسجلين. يمكنك حذف المجموعة فقط عندما تكون خالية من الطلاب.';
  }
  if (lower.includes('group name already exists')) {
    return 'اسم المجموعة موجود بالفعل، يرجى اختيار اسم آخر.';
  }
  if (lower.includes('cannot move student to an inactive group')) {
    return 'لا يمكن نقل الطالب إلى مجموعة غير نشطة.';
  }
  if (lower.includes('student is already in this group')) {
    return 'الطالب موجود في هذه المجموعة بالفعل.';
  }
  if (lower.includes('does not belong to this group')) {
    return 'عفواً، هذا الطالب غير مسجل في هذه المجموعة الدراسية. يرجى التأكد من اختيار المجموعة الصحيحة للطالب.';
  }
  if (lower.includes('group not found')) {
    return 'المجموعة الدراسية غير موجودة.';
  }
  if (lower.includes('lesson not found')) {
    return 'الدرس المطلوب غير موجود أو تم حذفه.';
  }
  if (lower.includes('invalid lesson id format')) {
    return 'معرف الدرس غير صحيح.';
  }
  if (lower.includes('order is required')) {
    return 'ترتيب الدرس مطلوب.';
  }
  if (lower.includes('title is required')) {
    return 'عنوان العنصر مطلوب.';
  }
  if (lower.includes('content url is required') || lower.includes('file key')) {
    return 'ملف الفيديو مطلوب لإنشاء الدرس.';
  }

  return null;
};
