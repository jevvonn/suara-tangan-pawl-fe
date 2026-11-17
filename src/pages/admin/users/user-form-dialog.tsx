import { useState } from 'react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, getErrorMessage } from '@/lib/api/errors'
import { useCreateUser, useUpdateUser } from '@/lib/api/queries'
import type { User, UserRole } from '@/lib/api/types'
import { FormDialog } from '@/pages/admin/components/form-dialog'
import { FormField, adminInputClassName } from '@/pages/admin/components/form-field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

type Errors = { name?: string; email?: string }

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = user !== null
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const pending = createUser.isPending || updateUser.isPending

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user')
  const [errors, setErrors] = useState<Errors>({})

  function validate(): Errors {
    const next: Errors = {}
    if (!name.trim()) next.name = 'Nama wajib diisi.'
    if (!email.trim()) next.email = 'Email wajib diisi.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Format email tidak valid.'
    return next
  }

  async function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const input = { name, email, role }
    try {
      if (isEdit) {
        await updateUser.mutateAsync({ id: user.id, input })
        toast.success(`${name.trim()} berhasil diperbarui.`)
      } else {
        await createUser.mutateAsync(input)
        toast.success(`${name.trim()} berhasil ditambahkan.`)
      }
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError && error.field) {
        setErrors({ [error.field]: error.message })
      } else {
        toast.error(getErrorMessage(error))
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit User' : 'Tambah User'}
      description={isEdit ? `Perbarui data ${user.name}.` : 'Tambahkan pengguna baru.'}
      pending={pending}
      onSubmit={handleSubmit}
    >
      <FormField id="user-name" label="Nama" error={errors.name}>
        <Input
          id="user-name"
          value={name}
          autoComplete="off"
          autoFocus
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name) || undefined}
          aria-describedby={errors.name ? 'user-name-error' : undefined}
          className={adminInputClassName}
        />
      </FormField>

      <FormField id="user-email" label="Email" error={errors.email}>
        <Input
          id="user-email"
          type="email"
          value={email}
          autoComplete="off"
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? 'user-email-error' : undefined}
          className={adminInputClassName}
        />
      </FormField>

      <FormField id="user-role" label="Role">
        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
          <SelectTrigger
            id="user-role"
            className="h-11! w-full rounded-[16px] border-0 bg-muted px-4 text-sm font-medium focus-visible:ring-primary/50"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[16px]">
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </FormDialog>
  )
}
