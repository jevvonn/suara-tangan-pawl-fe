import { useState } from 'react'
import { toast } from 'sonner'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, getErrorMessage } from '@/lib/api/errors'
import { useUpdateUserRole } from '@/lib/api/queries'
import type { User, UserRole } from '@/lib/api/types'
import { getInitials } from '@/lib/format'
import { FormDialog } from '@/pages/admin/components/form-dialog'
import { FormField } from '@/pages/admin/components/form-field'

const ROLE_LABEL: Record<UserRole, string> = { admin: 'Admin', user: 'User' }

type UserRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The user whose role is being changed. */
  user: User | null
}

/**
 * Admins can only change a user's role. Name and email belong to the user,
 * and new users sign up themselves.
 */
export function UserRoleDialog({ open, onOpenChange, user }: UserRoleDialogProps) {
  const updateUserRole = useUpdateUserRole()
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user')
  const [error, setError] = useState<string>()

  if (!user) return null

  async function handleSubmit() {
    if (!user) return
    if (role === user.role) {
      onOpenChange(false)
      return
    }

    try {
      await updateUserRole.mutateAsync({ id: user.id, input: { role } })
      toast.success(`Role ${user.name} diubah menjadi ${ROLE_LABEL[role]}.`)
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError && err.field === 'role') {
        setError(err.message)
      } else {
        toast.error(getErrorMessage(err))
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ubah Role"
      description="Admin dapat mengelola letters, education news, dan users."
      pending={updateUserRole.isPending}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3 rounded-[16px] bg-muted px-4 py-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-amber text-xs font-bold text-primary-foreground"
        >
          {getInitials(user.name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-bold text-foreground">{user.name}</span>
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <FormField id="user-role" label="Role" error={error}>
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value as UserRole)
            setError(undefined)
          }}
        >
          <SelectTrigger
            id="user-role"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'user-role-error' : undefined}
            className="h-11! w-full rounded-[16px] border-0 bg-muted px-4 text-sm font-medium focus-visible:ring-primary/50"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[16px]">
            <SelectItem value="user">{ROLE_LABEL.user}</SelectItem>
            <SelectItem value="admin">{ROLE_LABEL.admin}</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </FormDialog>
  )
}
