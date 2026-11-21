import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'

import {
  createEducationNews,
  deleteEducationNews,
  getEducationNews,
  listEducationNews,
  updateEducationNews,
} from '@/lib/api/education-news'
import {
  deleteFavoriteSentence,
  listFavoriteSentences,
  saveFavoriteSentence,
} from '@/lib/api/favorites'
import {
  createLetter,
  deleteLetter,
  listLetters,
  translateSentence,
  updateLetter,
} from '@/lib/api/letters'
import { getDashboardStats } from '@/lib/api/stats'
import type {
  EducationNews,
  EducationNewsInput,
  LetterInput,
  UserRoleInput,
} from '@/lib/api/types'
import { deleteUser, listUsers, updateUserRole } from '@/lib/api/users'

export const queryKeys = {
  /** The logged-in user; see `useSession` in `@/hooks/use-session`. */
  session: ['session'],
  stats: ['dashboard-stats'],
  letters: ['letters'],
  users: ['users'],
  educationNews: ['education-news'],
  translate: ['translate'],
  favorites: ['favorite-sentences'],
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

// Landing page translator: the letters for a sentence (cached per sentence, ignoring case).
export const useTranslation = (sentence: string) =>
  useQuery({
    queryKey: [...queryKeys.translate, sentence.toUpperCase()],
    queryFn: ({ signal }) => translateSentence(sentence, signal),
    enabled: sentence.trim() !== '',
  })

// Favorite sentences (logged-in users). Pass `enabled: false` when logged out.
export const useFavoriteSentences = (enabled = true) =>
  useQuery({ queryKey: queryKeys.favorites, queryFn: listFavoriteSentences, enabled })
export const useSaveFavoriteSentence = () =>
  useInvalidatingMutation(saveFavoriteSentence, queryKeys.favorites)
export const useDeleteFavoriteSentence = () =>
  useInvalidatingMutation(deleteFavoriteSentence, queryKeys.favorites)

// Users
export const useUsers = () => useQuery({ queryKey: queryKeys.users, queryFn: listUsers })
export const useUpdateUserRole = () =>
  useInvalidatingMutation(
    ({ id, input }: { id: string; input: UserRoleInput }) => updateUserRole(id, input),
    queryKeys.users,
  )
export const useDeleteUser = () => useInvalidatingMutation(deleteUser, queryKeys.users)

// Education news
export const useEducationNews = () =>
  useQuery({ queryKey: queryKeys.educationNews, queryFn: listEducationNews })
/**
 * One news item (public detail page). Its key starts with `queryKeys.educationNews`, so
 * admin changes refresh it too. While it loads, the item from the cached list is shown.
 */
export const useEducationNewsItem = (id: string) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: [...queryKeys.educationNews, id],
    queryFn: () => getEducationNews(id),
    placeholderData: () =>
      queryClient
        .getQueryData<EducationNews[]>(queryKeys.educationNews)
        ?.find((news) => news.id === id),
  })
}
export const useCreateEducationNews = () =>
  useInvalidatingMutation(createEducationNews, queryKeys.educationNews)
export const useUpdateEducationNews = () =>
  useInvalidatingMutation(
    ({ id, input }: { id: string; input: EducationNewsInput }) => updateEducationNews(id, input),
    queryKeys.educationNews,
  )
export const useDeleteEducationNews = () =>
  useInvalidatingMutation(deleteEducationNews, queryKeys.educationNews)
