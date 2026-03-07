import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/header'
import { AuthProvider } from '@/lib/auth-context'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}
