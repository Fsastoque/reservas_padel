import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-court focus:outline-none focus:ring-2 focus:ring-court/15';

const labelClass = 'mb-1.5 block text-sm font-medium text-ink/70';

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/courts';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <aside className="hidden lg:block">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink/60">
          <span className="h-1.5 w-1.5 rounded-full bg-court" />
          Reservas del club
        </p>
        <h1 className="mt-5 max-w-md font-display text-5xl font-bold leading-[0.95] tracking-tight">
          Vuelve a la cancha que te espera.
        </h1>
        <p className="mt-5 max-w-sm text-ink/60">
          Consulta los bloques libres del día y asegura tu hora en segundos.
        </p>
        <div className="relative mt-10 h-44 max-w-md overflow-hidden rounded-2xl bg-court" aria-hidden="true">
          <div className="absolute inset-4 rounded-sm border border-white/55" />
          <div className="absolute inset-y-4 left-1/2 w-px bg-white/55" />
          <div className="absolute inset-x-4 top-1/2 h-px bg-white/20" />
        </div>
      </aside>

      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-ink/55">Usa el correo con el que te registraste.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className={labelClass} htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              className={inputClass}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className={inputClass}
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-court disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/55">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/register"
            state={{ from }}
            className="font-medium text-court underline-offset-4 hover:underline"
          >
            Crea una aquí
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
