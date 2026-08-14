import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { BootScreen } from '@/components/common/BootScreen'
import { Skeleton } from '@/components/common/Skeleton'
import ResearchPage from '@/pages/ResearchPage'

/**
 * `/` is the marketing landing page; the workspace lives under `/app`.
 *
 * Both the landing page and the workspace's secondary routes are split out —
 * the landing page pulls in Lenis and a lot of section code that someone
 * heading straight to /app never needs, and vice versa.
 */
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-6 py-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-28 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  )
}

/** Landing page occupies the full viewport, so it gets a plain dark hold. */
function LandingFallback() {
  return <div className="h-full w-full bg-canvas" />
}

export default function App() {
  return (
    <>
      <BootScreen />
      <Routes>
        <Route
          index
          element={
            <Suspense fallback={<LandingFallback />}>
              <LandingPage />
            </Suspense>
          }
        />

        <Route path="app" element={<AppLayout />}>
          <Route index element={<ResearchPage />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="library"
            element={
              <Suspense fallback={<PageFallback />}>
                <LibraryPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
