import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Header() {
  const { user, profile, signOut } = useAuth()
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-white bg-white/20' : 'text-slate-200 hover:text-white hover:bg-white/10'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10 border-b border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-base font-semibold tracking-wide text-white">Investment Terminal</div>
          <button
            type="button"
            className="hidden rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 md:block"
          >
            Press `/` to search
          </button>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/markets" className={linkClass}>
              Markets
            </NavLink>
            <NavLink to="/portfolio" className={linkClass}>
              Portfolio
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              Settings
            </NavLink>
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right md:block">
                <div className="text-sm font-medium text-white">{profile?.username || user.email}</div>
                <div className="text-xs text-slate-400">{profile?.favorite_ticker || 'No favorite ticker set'}</div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className={linkClass}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
