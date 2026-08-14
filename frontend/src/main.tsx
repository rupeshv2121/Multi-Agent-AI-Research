import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Research results are immutable once a job finishes; the live view comes
      // from SSE, so aggressive refetching would only add noise.
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="bottom-right"
            theme="dark"
            closeButton
            toastOptions={{
              style: {
                background: 'rgba(22,22,26,0.95)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff',
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
