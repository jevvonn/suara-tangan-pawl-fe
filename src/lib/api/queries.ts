import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'

import {
  createEducationNews,
  deleteEducationNews,
  listEducationNews,
  updateEducationNews,
} from '@/lib/api/education-news'
import { createLetter, deleteLetter, listLetters, updateLetter } from '@/lib/api/letters'
import { getDashboardStats } from '@/lib/api/stats'
import type { EducationNewsInput, LetterInput, UserInput } from '@/lib/api/types'
import { createUser, deleteUser, listUsers, updateUser } from '@/lib/api/users'

export const queryKeys = {
  stats: ['dashboard-stats'],
  letters: ['letters'],
  users: ['users'],
  educationNews: ['education-news'],
} as const satisfies Record<string, QueryKey>

/** A mutation that refreshes its own list and the dashboard stats on success. */
function useInvalidatingMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  listKey: QueryKey,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]),
  })
}

// Dashboard
export const useDashboardStats = () =>
  useQuery({ queryKey: queryKeys.stats, queryFn: getDashboardStats })

// Letters
export const useLetters = () => useQuery({ queryKey: queryKeys.letters, queryFn: listLetters })
export const useCreateLetter = () => useInvalidatingMutation(createLetter, queryKeys.letters)
export const useUpdateLetter = () =>
  useInvalidatingMutation(
    ({ id, input }: { id: string; input: LetterInput }) => updateLetter(id, input),
    queryKeys.letters,
  )
export const useDeleteLetter = () => useInvalidatingMutation(deleteLetter, queryKeys.letters)

// Users
export const useUsers = () => useQuery({ queryKey: queryKeys.users, queryFn: listUsers })
export const useCreateUser = () => useInvalidatingMutation(createUser, queryKeys.users)
export const useUpdateUser = () =>
  useInvalidatingMutation(
    ({ id, input }: { id: string; input: UserInput }) => updateUser(id, input),
    queryKeys.users,
  )
export const useDeleteUser = () => useInvalidatingMutation(deleteUser, queryKeys.users)

// Education news
export const useEducationNews = () =>
  useQuery({ queryKey: queryKeys.educationNews, queryFn: listEducationNews })
export const useCreateEducationNews = () =>
  useInvalidatingMutation(createEducationNews, queryKeys.educationNews)
export const useUpdateEducationNews = () =>
  useInvalidatingMutation(
    ({ id, input }: { id: string; input: EducationNewsInput }) => updateEducationNews(id, input),
    queryKeys.educationNews,
  )
export const useDeleteEducationNews = () =>
  useInvalidatingMutation(deleteEducationNews, queryKeys.educationNews)
