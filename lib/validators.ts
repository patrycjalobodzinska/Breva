import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
    confirmPassword: z.string().min(6, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const measurementUpdateSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").optional(),
  note: z.string().optional(),
});

export const manualMeasurementSchema = z.object({
  leftVolumeMl: z.number().min(0, "Objętość musi być dodatnia"),
  rightVolumeMl: z.number().min(0, "Objętość musi być dodatnia"),
  note: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MeasurementUpdateInput = z.infer<typeof measurementUpdateSchema>;
export type ManualMeasurementInput = z.infer<typeof manualMeasurementSchema>;
