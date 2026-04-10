import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Header() {
  const { user, profile, signOut } = useAuth()
  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm transition-colors ${
      isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,10,18,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <div>
            <div className="header-wordmark text-white">Investment Terminal</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-slate-500">Private Market Desk</div>
          </div>
          <div className="hidden h-8 w-px bg-white/8 lg:block" />
          <div className="hidden text-xs text-slate-500 lg:block">Press `/` to search</div>
        </div>
        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1">
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
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <div className="text-sm text-white">{profile?.username || user.email}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{profile?.favorite_ticker || 'No favorite ticker set'}</div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-white/8 px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/15 hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className="rounded-full border border-white/8 px-4 py-1.5 text-sm text-slate-300 transition hover:border-white/15 hover:text-white">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
