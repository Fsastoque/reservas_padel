import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { fetchCourts } from '../services/courtsApi';
import { getErrorMessage } from '../services/api';
import type { Court } from '../types';
import { todayLocalDate } from '../utils/datetime';

const inputClass =
  'rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink [color-scheme:light] focus:border-court focus:outline-none focus:ring-2 focus:ring-court/15';

const CourtDiagram = () => (
  <div className="relative h-24 overflow-hidden rounded-xl bg-court" aria-hidden="true">
    <div className="absolute inset-3 rounded-sm border border-white/60" />
    <div className="absolute inset-y-3 left-1/2 w-px bg-white/60" />
    <div className="absolute inset-x-3 top-1/2 h-px bg-white/25" />
  </div>
);

export const Courts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courts, setCourts] = useState<Court[]>([]);
  const [date, setDate] = useState(todayLocalDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCourts(await fetchCourts());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourts();
  }, [loadCourts]);

  const handleSelectCourt = (court: Court) => {
    const bookingUrl = `/booking/${court.id}?date=${date}`;

    if (user) {
      navigate(bookingUrl);
      return;
    }

    navigate('/login', { state: { from: bookingUrl } });
  };

  return (
    <div className="py-6 sm:py-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-court px-6 py-12 text-white sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-1/2 hidden h-64 w-80 -translate-y-1/2 rotate-[-8deg] rounded-3xl border border-white/15 md:block"
        >
          <div className="absolute inset-6 rounded-xl border border-white/20" />
          <div className="absolute inset-y-6 left-1/2 w-px bg-white/20" />
          <div className="absolute inset-x-6 top-1/2 h-px bg-white/10" />
        </div>

        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-ball" />
            Cinco canchas del club
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
            Tu próxima hora
            <br />
            empieza en la cancha.
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/70">
            Elige cancha y fecha para ver los bloques libres. Cada reserva dura una hora y se
            confirma al instante.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Elige cancha y fecha</h2>
          <p className="mt-1 text-sm text-ink/55">Solo puedes reservar hoy o días futuros.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/65">Fecha de juego</span>
          <input
            type="date"
            className={inputClass}
            min={todayLocalDate()}
            value={date}
            onChange={(event) => setDate(event.target.value || todayLocalDate())}
          />
        </label>
      </div>

      {!user && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink/65">
          <span>Puedes explorar las canchas y elegir la fecha. Para ver los horarios necesitas una sesión.</span>
          <Link to="/login" className="font-medium text-court underline-offset-4 hover:underline">
            Iniciar sesión
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-6 space-y-3">
          <Alert>{error}</Alert>
          <button
            type="button"
            onClick={() => void loadCourts()}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-court/40 hover:text-ink motion-reduce:transition-none"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando canchas…" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <article
              key={court.id}
              className="flex flex-col rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-court motion-reduce:transition-none"
            >
              <CourtDiagram />
              <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight">{court.name}</h3>
                  <p className="mt-1 text-sm text-ink/50">Bloques de una hora, todo el día.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCourt(court)}
                  className="w-full rounded-xl border border-ink px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white motion-reduce:transition-none"
                >
                  {user ? 'Ver horarios' : 'Inicia sesión para reservar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
