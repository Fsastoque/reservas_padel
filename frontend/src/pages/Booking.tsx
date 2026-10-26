import { useCallback, useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Alert } from '../components/Alert';
import { AvailabilityGrid } from '../components/AvailabilityGrid';
import { Loading } from '../components/Loading';
import { fetchAvailability, fetchCourts } from '../services/courtsApi';
import { getErrorMessage, isUnauthorized } from '../services/api';
import { createReservation as createReservationRequest } from '../services/reservationsApi';
import type { AvailabilityResponse, Court, Reservation } from '../types';
import {
  formatDateLong,
  formatHour,
  formatHourRange,
  isDateString,
  todayLocalDate,
} from '../utils/datetime';

const inputClass =
  'rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink [color-scheme:light] focus:border-court focus:outline-none focus:ring-2 focus:ring-court/15';

const Legend = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink/55">
    <li className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full border border-court/40 bg-white" />
      Disponible
    </li>
    <li className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
      Reservado
    </li>
    <li className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full border border-line bg-surface" />
      Hora pasada
    </li>
  </ul>
);

export const Booking = () => {
  const { courtId: courtIdParam } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const courtId = Number(courtIdParam);
  const isValidCourtId = Number.isInteger(courtId) && courtId > 0;

  const today = todayLocalDate();
  const requestedDate = searchParams.get('date') ?? '';
  const date = isDateString(requestedDate) && requestedDate >= today ? requestedDate : today;

  const [courts, setCourts] = useState<Court[]>([]);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);

  useEffect(() => {
    let active = true;

    fetchCourts()
      .then((list) => {
        if (active) setCourts(list);
      })
      .catch(() => {
        /* El nombre de la cancha no es imprescindible para reservar. */
      });

    return () => {
      active = false;
    };
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!isValidCourtId) return;

    setLoadingAvailability(true);
    setError(null);

    try {
      setAvailability(await fetchAvailability(courtId, date));
    } catch (loadError) {
      if (isUnauthorized(loadError)) {
        navigate('/login', {
          replace: true,
          state: { from: `/booking/${courtId}?date=${date}` },
        });
        return;
      }

      setAvailability(null);
      setError(getErrorMessage(loadError));
    } finally {
      setLoadingAvailability(false);
    }
  }, [courtId, date, isValidCourtId, navigate]);

  useEffect(() => {
    setSelectedHour(null);
    setConfirmation(null);
    setBookingError(null);
    void loadAvailability();
  }, [loadAvailability]);

  if (!isValidCourtId) return <Navigate to="/courts" replace />;

  const court = courts.find((item) => item.id === courtId);
  const selectedBlock = availability?.blocks.find((block) => block.hour === selectedHour) ?? null;

  const handleDateChange = (value: string) => {
    if (!isDateString(value) || value < today) {
      setSearchParams({ date: today });
      return;
    }

    setSearchParams({ date: value });
  };

  const handleSelectHour = (hour: number) => {
    setSelectedHour(hour);
    setBookingError(null);
    setConfirmation(null);
  };

  const handleConfirm = async () => {
    if (selectedHour === null || booking) return;

    setBooking(true);
    setBookingError(null);

    try {
      const reservation = await createReservationRequest({ courtId, date, hour: selectedHour });
      setConfirmation(reservation);
      setSelectedHour(null);

      try {
        setAvailability(await fetchAvailability(courtId, date));
      } catch {
        /* La grilla se actualizará en la próxima consulta. */
      }
    } catch (submitError) {
      if (isUnauthorized(submitError)) {
        navigate('/login', {
          replace: true,
          state: { from: `/booking/${courtId}?date=${date}` },
        });
        return;
      }

      setBookingError(getErrorMessage(submitError));

      try {
        setAvailability(await fetchAvailability(courtId, date));
      } catch {
        /* Mantiene la grilla anterior si la reconsulta falla. */
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <Link
        to="/courts"
        className="text-sm font-medium text-ink/55 underline-offset-4 hover:text-ink hover:underline"
      >
        ← Volver a canchas
      </Link>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {court?.name ?? 'Cancha'}
          </h1>
          <p className="mt-1 text-ink/55">{formatDateLong(date)}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/65">Fecha de juego</span>
          <input
            type="date"
            className={inputClass}
            min={today}
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
          />
        </label>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-line bg-white p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Horarios del día</h2>
            <Legend />
          </div>

          {loadingAvailability ? (
            <Loading label="Consultando disponibilidad…" />
          ) : error ? (
            <div className="space-y-3">
              <Alert>{error}</Alert>
              <button
                type="button"
                onClick={() => void loadAvailability()}
                className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-court/40 hover:text-ink motion-reduce:transition-none"
              >
                Reintentar
              </button>
            </div>
          ) : availability ? (
            <AvailabilityGrid
              blocks={availability.blocks}
              date={date}
              selectedHour={selectedHour}
              onSelect={handleSelectHour}
            />
          ) : null}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Tu reserva</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink/50">Cancha</dt>
                <dd className="text-right font-medium">{court?.name ?? 'Cancha seleccionada'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink/50">Fecha</dt>
                <dd className="text-right font-medium">{formatDateLong(date)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink/50">Hora</dt>
                <dd className="text-right font-medium">
                  {selectedBlock
                    ? formatHourRange(selectedBlock.hour, selectedBlock.hour + 1)
                    : 'Sin elegir'}
                </dd>
              </div>
            </dl>

            {confirmation ? (
              <div className="mt-5 rounded-xl border border-ball bg-ball/40 p-4">
                <p className="font-display text-2xl font-semibold">Reserva confirmada</p>
                <p className="mt-1 text-sm text-ink/70">
                  {confirmation.courtName} · {formatDateLong(confirmation.date)} ·{' '}
                  {formatHour(confirmation.startHour)} – {formatHour(confirmation.endHour)}
                </p>
                <Link
                  to="/mis-reservas"
                  className="mt-4 inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-court motion-reduce:transition-none"
                >
                  Ver mis reservas
                </Link>
              </div>
            ) : selectedHour === null ? (
              <p className="mt-5 text-sm text-ink/55">
                Selecciona un bloque disponible de la grilla para continuar.
              </p>
            ) : (
              <>
                {bookingError && (
                  <div className="mt-4">
                    <Alert>{bookingError}</Alert>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={booking}
                  className="mt-5 w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-court disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                >
                  {booking ? 'Confirmando…' : `Confirmar ${formatHour(selectedHour)}`}
                </button>
                <p className="mt-3 text-xs text-ink/45">El pago se realiza en el club al llegar.</p>
              </>
            )}

            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink/45">
              Solo puedes tener una reserva vigente a la vez. Cancela la actual o espera a que pase
              para reservar otro turno.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
