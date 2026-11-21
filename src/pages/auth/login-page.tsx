import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/use-session'
import { setApiFieldErrors } from '@/lib/api/errors'
import { getAuthErrorMessage, translateAuthFieldError } from '@/pages/auth/auth-errors'
import { errorProps, loginSchema, type LoginValues } from '@/pages/auth/auth-schemas'
import {
  AuthCard,
  AuthField,
  PasswordInput,
  authInputClassName,
} from '@/pages/auth/auth-ui'

/** API field name → form field. */
const API_FIELDS = { email: 'email', password: 'password' } as const

export function LoginPage() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    try {
      const { user } = await login.mutateAsync(values)
      toast.success(`Selamat datang, ${user.name}!`)
      // No navigate() here: <GuestOnly> redirects by role as soon as the session has a user.
    } catch (error) {
      if (!setApiFieldErrors(error, setError, API_FIELDS, translateAuthFieldError)) {
        setError('root', { message: getAuthErrorMessage(error) })
      }
    }
  }

  return (
    <>
      <title>Masuk · Suara Tangan</title>
      <AuthCard
        title="Selamat Datang"
        highlight="Kembali"
        description="Masuk untuk melanjutkan belajar bahasa isyarat."
        footer={
          <>
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-foreground underline-offset-4 hover:underline"
            >
              Daftar sekarang
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

          <AuthField id="login-email" label="Email" error={errors.email?.message}>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="nama@email.com"
              className={authInputClassName}
              {...errorProps('login-email', errors.email?.message)}
              {...register('email')}
            />
          </AuthField>

          <AuthField id="login-password" label="Kata sandi" error={errors.password?.message}>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              {...errorProps('login-password', errors.password?.message)}
              {...register('password')}
            />
          </AuthField>

          <Button
            type="submit"
            variant="brand"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full text-base"
          >
            {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
            Masuk
          </Button>
        </form>
      </AuthCard>
    </>
  )
}
