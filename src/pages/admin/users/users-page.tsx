import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getErrorMessage } from '@/lib/api/errors'
import { useDeleteUser, useUsers } from '@/lib/api/queries'
import type { User, UserRole } from '@/lib/api/types'
import { formatDate, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ConfirmDeleteDialog } from '@/pages/admin/components/confirm-delete-dialog'
import { EmptyState } from '@/pages/admin/components/empty-state'
import { FilterChips } from '@/pages/admin/components/filter-chips'
import { PageHeader } from '@/pages/admin/components/page-header'
import { SearchInput } from '@/pages/admin/components/search-input'
import { UserFormDialog } from '@/pages/admin/users/user-form-dialog'

const ROLE_LABEL: Record<UserRole, string> = { admin: 'Admin', user: 'User' }

type RoleFilter = 'all' | UserRole

const FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

const headClassName =
  'h-11 px-4 text-[11px] font-bold tracking-[0.44px] text-muted-foreground uppercase'

export function UsersPage() {
  const { data: users, isPending, isError, error } = useUsers()
  const deleteUser = useDeleteUser()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (users ?? []).filter(
      (u) =>
        (role === 'all' || u.role === role) &&
        (u.name.toLowerCase().includes(query) || u.email.includes(query)),
    )
  }, [users, search, role])

  function openForm(user: User | null) {
    setEditing(user)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteUser.mutateAsync(deleting.id)
      toast.success(`${deleting.name} berhasil dihapus.`)
      setDeleteOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Kelola pengguna dan hak akses admin."
        actions={
          <Button variant="brand" size="pill" onClick={() => openForm(null)}>
            <Plus aria-hidden />
            Tambah User
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          label="Cari user"
          placeholder="Cari nama atau email…"
          value={search}
          onChange={setSearch}
        />
        <FilterChips label="Filter role" value={role} options={FILTER_OPTIONS} onChange={setRole} />
      </div>

      {isError ? (
        <p role="alert" className="rounded-[32px] bg-card p-6 text-sm text-destructive">
          Gagal memuat data: {getErrorMessage(error)}
        </p>
      ) : !isPending && filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={users.length === 0 ? 'Belum ada user' : 'Tidak ditemukan'}
          description={
            users.length === 0 ? 'Tambahkan pengguna pertama.' : 'Coba kata kunci atau filter lain.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[32px] bg-card p-2 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={headClassName}>Nama</TableHead>
                <TableHead className={headClassName}>Email</TableHead>
                <TableHead className={headClassName}>Role</TableHead>
                <TableHead className={headClassName}>Dibuat</TableHead>
                <TableHead className={cn(headClassName, 'text-right')}>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell colSpan={5} className="px-4 py-3">
                        <Skeleton className="h-9 rounded-full bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtered.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/50">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-amber text-xs font-bold text-primary-foreground"
                          >
                            {getInitials(user.name)}
                          </span>
                          <span className="font-bold text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openForm(user)}
                            aria-label={`Edit ${user.name}`}
                            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleting(user)
                              setDeleteOpen(true)
                            }}
                            aria-label={`Hapus ${user.name}`}
                            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UserFormDialog key={formKey} open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Hapus ${deleting?.name ?? 'user'}?`}
        description="User ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        pending={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] leading-4 font-bold tracking-[0.44px]',
        role === 'admin'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground',
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  )
}
