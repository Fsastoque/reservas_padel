import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${
    isActive ? 'bg-court/10 text-court' : 'text-ink/65 hover:text-ink'
  }`;

const CourtMark = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 28 28"
    className="h-7 w-7"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="2.5" y="4.5" width="23" height="19" rx="2" className="text-court" />
    <path d="M14 4.5v19" className="text-court" />
    <path d="M2.5 14h23" className="text-court/40" />
    <circle cx="14" cy="14" r="2.2" className="fill-ball stroke-none" />
  </svg>
);

export const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/courts');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <Link to="/courts" className="flex items-center gap-2.5" aria-label="Pádel Club, ir a canchas">
            <CourtMark />
            <span className="font-display text-2xl font-bold tracking-tight">Pádel Club</span>
          </Link>
          <nav className="ml-3 hidden items-center gap-1 sm:flex">
            <NavLink to="/courts" className={navLinkClass}>
              Canchas
            </NavLink>
            {user && (
              <NavLink to="/mis-reservas" className={navLinkClass}>
                Mis reservas
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="h-8 w-24 animate-pulse rounded-lg bg-line/70 motion-reduce:animate-none" />
          ) : user ? (
            <>
              <NavLink to="/mis-reservas" className={`sm:hidden ${navLinkClass}`}>
                Mis reservas
              </NavLink>
              <span className="hidden max-w-[160px] truncate text-sm text-ink/55 md:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/65 transition-colors hover:text-ink motion-reduce:transition-none"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/65 transition-colors hover:text-ink motion-reduce:transition-none"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-court motion-reduce:transition-none"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
