import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-court focus:outline-none focus:ring-2 focus:ring-court/15';

const labelClass = 'mb-1.5 block text-sm font-medium text-ink/70';

export const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/courts';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      await register(email.trim(), password, confirmPassword);
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
          <span className="h-1.5 w-1.5 rounded-full bg-ball" />
          Cinco canchas disponibles
        </p>
        <h1 className="mt-5 max-w-md font-display text-5xl font-bold leading-[0.95] tracking-tight">
          Tu hora, tu cancha, tu partido.
        </h1>
        <p className="mt-5 max-w-sm text-ink/60">
          Crea tu cuenta para ver la disponibilidad hora por hora y reservar tu turno.
        </p>
        <div className="relative mt-10 h-44 max-w-md overflow-hidden rounded-2xl bg-court" aria-hidden="true">
          <div className="absolute inset-4 rounded-sm border border-white/55" />
          <div className="absolute inset-y-4 left-1/2 w-px bg-white/55" />
          <div className="absolute inset-x-4 top-1/2 h-px bg-white/20" />
        </div>
      </aside>

      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="mt-1 text-sm text-ink/55">Solo necesitas un correo y una contraseña.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className={labelClass} htmlFor="register-email">
              Correo electrónico
            </label>
            <input
              id="register-email"
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
            <label className={labelClass} htmlFor="register-password">
              Contraseña
            </label>
            <input
              id="register-password"
              className={inputClass}
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="register-confirm-password">
              Confirma tu contraseña
            </label>
            <input
              id="register-confirm-password"
              className={inputClass}
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-court disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {submitting ? 'Creando tu cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/55">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            state={{ from }}
            className="font-medium text-court underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
