import { z } from 'zod'

const MIN_PASSWORD_LENGTH = 8

const email = z
  .string()
  .trim()
  .min(1, 'Email wajib diisi.')
  .pipe(z.email('Format email tidak valid.'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nama wajib diisi.')
      .max(100, 'Nama maksimal 100 karakter.'),
    email,
    password: z
      .string()
      .min(1, 'Kata sandi wajib diisi.')
      .min(MIN_PASSWORD_LENGTH, `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`),
    passwordConfirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Konfirmasi kata sandi tidak sama.',
    path: ['passwordConfirmation'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

/** aria props for an input that may have a validation error. */
export function errorProps(id: string, error: string | undefined) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  } as const
}
