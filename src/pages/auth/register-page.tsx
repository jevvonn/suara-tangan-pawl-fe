import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { register as registerAccount } from '@/lib/api/auth'
import { ApiError, getErrorMessage } from '@/lib/api/errors'
import { errorProps, registerSchema, type RegisterValues } from '@/pages/auth/auth-schemas'
import {
  AuthCard,
  AuthField,
  PasswordInput,
  authInputClassName,
} from '@/pages/auth/auth-ui'

const FIELDS = ['name', 'email', 'password', 'passwordConfirmation'] as const

export function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' },
  })

  async function onSubmit(values: RegisterValues) {
    try {
      await registerAccount(values)
      toast.success('Akun berhasil dibuat. Silakan masuk.')
      navigate('/login', { replace: true })
    } catch (error) {
      const field = error instanceof ApiError ? error.field : undefined
      if (field && (FIELDS as readonly string[]).includes(field)) {
        setError(field as (typeof FIELDS)[number], { message: getErrorMessage(error) })
      } else {
        setError('root', { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <>
      <title>Daftar · Suara Tangan</title>
      <AuthCard
        title="Gabung"
        highlight="Sekarang"
        description="Buat akun gratis dan mulai belajar BISINDO & SIBI."
        footer={
          <>
            Sudah punya akun?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-foreground underline-offset-4 hover:underline"
            >
              Masuk
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {errors.root && (
            <p
              role="alert"
              className="rounded-[16px] bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {errors.root.message}
            </p>
          )}

          <AuthField id="register-name" label="Nama" error={errors.name?.message}>
            <Input
              id="register-name"
              autoComplete="name"
              autoFocus
              placeholder="Nama lengkap"
              className={authInputClassName}
              {...errorProps('register-name', errors.name?.message)}
              {...register('name')}
            />
          </AuthField>

          <AuthField id="register-email" label="Email" error={errors.email?.message}>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className={authInputClassName}
              {...errorProps('register-email', errors.email?.message)}
              {...register('email')}
            />
          </AuthField>

          <AuthField id="register-password" label="Kata sandi" error={errors.password?.message}>
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              {...errorProps('register-password', errors.password?.message)}
              {...register('password')}
            />
          </AuthField>

          <AuthField
            id="register-password-confirmation"
            label="Konfirmasi kata sandi"
            error={errors.passwordConfirmation?.message}
          >
            <PasswordInput
              id="register-password-confirmation"
              autoComplete="new-password"
              placeholder="Ulangi kata sandi"
              {...errorProps('register-password-confirmation', errors.passwordConfirmation?.message)}
              {...register('passwordConfirmation')}
            />
          </AuthField>

          <Button
            type="submit"
            variant="brand"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full text-base"
          >
            {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
            Daftar
          </Button>
        </form>
      </AuthCard>
    </>
  )
}
