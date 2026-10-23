import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({ component: RootLayout })

const navLinks = [
  { to: '/', label: 'Watchlist' },
  { to: '/track-record', label: 'Track record' },
  { to: '/settings', label: 'Settings' },
] as const

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-semibold">Stock Predictor</span>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              activeProps={{ className: 'text-slate-900 dark:text-slate-100 font-medium' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-800">
        Personal research tool. Predictions are probabilistic estimates, not investment advice.
      </footer>
    </div>
  )
}
