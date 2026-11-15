import { z } from 'zod';
import { Grade } from '../../types/grade';
import { AcademicTrack } from '../../types/academicTrack';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'اسم الطالب مطلوب' })
      .min(3, { message: 'يرجى إدخال اسم الطالب الثلاثي على الأقل' }),
    phone: z
      .string()
      .min(1, { message: 'رقم هاتف الطالب مطلوب' })
      .regex(/^01[0125][0-9]{8}$/, { message: 'يرجى إدخال رقم هاتف مصري صحيح (11 رقم)' }),
    parentPhone: z
      .string()
      .optional()
      .refine((val) => !val || /^01[0125][0-9]{8}$/.test(val), {
        message: 'يرجى إدخال رقم هاتف مصري صحيح لولي الأمر',
      }),
    grade: z.enum([Grade.FirstSecondary, Grade.SecondSecondary, Grade.ThirdSecondary], {
      message: 'يرجى اختيار المرحلة الدراسية',
    }),
    groupId: z.string().optional(),
    academicTrack: z.enum([AcademicTrack.General, AcademicTrack.Baccalaureate]).optional(),
    password: z
      .string()
      .min(1, { message: 'كلمة المرور مطلوبة' })
      .min(4, { message: 'كلمة المرور يجب أن تكون 4 عناصر على الأقل' }),
    confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.grade === Grade.SecondSecondary) {
      if (!data.academicTrack) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'يرجى اختيار المسار الأكاديمي (عام أو بكالوريا)',
          path: ['academicTrack'],
        });
      }
    } else {
      if (!data.groupId || data.groupId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'يرجى اختيار المجموعة الدراسية',
          path: ['groupId'],
        });
      }
    }
  });

export type RegisterInputs = z.infer<typeof registerSchema>;

