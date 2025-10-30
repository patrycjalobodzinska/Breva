import { z } from "zod";

// Schemat walidacji dla rejestracji
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Imię musi mieć co najmniej 2 znaki")
      .max(50, "Imię nie może mieć więcej niż 50 znaków"),
    email: z
      .string()
      .email("Nieprawidłowy adres email")
      .min(5, "Email musi mieć co najmniej 5 znaków")
      .max(100, "Email nie może mieć więcej niż 100 znaków"),
    password: z
      .string()
      .min(6, "Hasło musi mieć co najmniej 6 znaków")
      .max(100, "Hasło nie może mieć więcej niż 100 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę i jedną cyfrę"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

// Schemat walidacji dla logowania
export const loginSchema = z.object({
  email: z
    .string()
    .email("Nieprawidłowy adres email")
    .min(1, "Email jest wymagany"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .max(100, "Hasło nie może mieć więcej niż 100 znaków"),
});

// Schemat walidacji dla zmiany hasła
export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Nowe hasło musi mieć co najmniej 6 znaków")
      .max(100, "Nowe hasło nie może mieć więcej niż 100 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Nowe hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę i jedną cyfrę"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

// Schemat walidacji dla pomiarów
export const measurementSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa pomiaru jest wymagana")
    .max(100, "Nazwa pomiaru nie może mieć więcej niż 100 znaków"),
  leftVolumeMl: z
    .number()
    .min(0, "Objętość lewej piersi nie może być ujemna")
    .max(10000, "Objętość lewej piersi nie może przekraczać 10000ml"),
  rightVolumeMl: z
    .number()
    .min(0, "Objętość prawej piersi nie może być ujemna")
    .max(10000, "Objętość prawej piersi nie może przekraczać 10000ml"),
  note: z
    .string()
    .max(500, "Notatka nie może mieć więcej niż 500 znaków")
    .optional(),
});

// Schemat walidacji dla pomiarów ręcznych
export const manualMeasurementSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa pomiaru jest wymagana")
    .max(100, "Nazwa pomiaru nie może mieć więcej niż 100 znaków"),
  leftVolumeMl: z
    .number()
    .min(0, "Objętość lewej piersi nie może być ujemna")
    .max(10000, "Objętość lewej piersi nie może przekraczać 10000ml"),
  rightVolumeMl: z
    .number()
    .min(0, "Objętość prawej piersi nie może być ujemna")
    .max(10000, "Objętość prawej piersi nie może przekraczać 10000ml"),
});

// Typy TypeScript wygenerowane ze schematów
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type MeasurementFormData = z.infer<typeof measurementSchema>;
export type ManualMeasurementFormData = z.infer<typeof manualMeasurementSchema>;
