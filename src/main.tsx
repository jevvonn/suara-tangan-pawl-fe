import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ApiError } from '@/lib/api/errors'
import { router } from '@/router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retry only when retrying can help (server unreachable or a 5xx). A 4xx such as
      // 403/404/422 won't change on retry, so show it right away.
      retry: (failureCount, error) =>
        failureCount < 2 &&
        error instanceof ApiError &&
        (error.status === 0 || error.status >= 500),
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)
