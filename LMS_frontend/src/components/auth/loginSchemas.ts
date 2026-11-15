import { z } from 'zod';

export const teacherSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'صيغة البريد الإلكتروني غير صحيحة' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
  rememberMe: z.boolean().optional(),
});

export const studentSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'رقم الهاتف مطلوب' })
    .regex(/^01[0125][0-9]{8}$/, { message: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
  rememberMe: z.boolean().optional(),
});

export type TeacherInputs = z.infer<typeof teacherSchema>;
export type StudentInputs = z.infer<typeof studentSchema>;

