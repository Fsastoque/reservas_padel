import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { getErrorMessage, isUnauthorized } from '../services/api';
import { cancelReservation, fetchMyReservations } from '../services/reservationsApi';
import type { Reservation, ReservationsResponse } from '../types';
import { formatDateLong, formatHour, formatHourRange } from '../utils/datetime';

interface StatusBadgeProps {
  reservation: Reservation;
  isUpcoming: boolean;
}

const StatusBadge = ({ reservation, isUpcoming }: StatusBadgeProps) => {
  if (reservation.status === 'cancelled') {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
        Cancelada
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        isUpcoming ? 'bg-court/10 text-court' : 'bg-ink/[0.06] text-ink/50'
      }`}
    >
      {isUpcoming ? 'Confirmada' : 'Finalizada'}
    </span>
  );
};

interface ReservationCardProps {
  reservation: Reservation;
  isUpcoming: boolean;
  cancellable?: boolean;
  pendingCancel?: boolean;
  cancelling?: boolean;
  onRequestCancel?: () => void;
  onDismissCancel?: () => void;
  onConfirmCancel?: () => void;
}

const ReservationCard = ({
  reservation,
  isUpcoming,
  cancellable = false,
  pendingCancel = false,
  cancelling = false,
  onRequestCancel,
  onDismissCancel,
  onConfirmCancel,
}: ReservationCardProps) => (
  <article className="rounded-2xl border border-line bg-white p-4 sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-court text-white">
          <span className="font-display text-lg font-semibold leading-none">
            {formatHour(reservation.startHour)}
          </span>
          <span className="mt-0.5 text-[10px] text-white/65">1 hora</span>
        </div>
        <div>
          <h3 className="font-display text-2xl font-semibold leading-tight">
            {reservation.courtName}
          </h3>
          <p className="mt-0.5 text-sm text-ink/55">{formatDateLong(reservation.date)}</p>
          <p className="mt-1 text-sm text-ink/70">
            {formatHourRange(reservation.startHour, reservation.endHour)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <StatusBadge reservation={reservation} isUpcoming={isUpcoming} />
        {cancellable && !pendingCancel && (
          <button
            type="button"
            onClick={onRequestCancel}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 motion-reduce:transition-none"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>

    {pendingCancel && (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-900">
          ¿Cancelar esta reserva? El bloque quedará disponible para otros jugadores.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={cancelling}
            className="rounded-lg bg-red-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {cancelling ? 'Cancelando…' : 'Sí, cancelar reserva'}
          </button>
          <button
            type="button"
            onClick={onDismissCancel}
            disabled={cancelling}
            className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink disabled:opacity-60 motion-reduce:transition-none"
          >
            Mantener reserva
          </button>
        </div>
      </div>
    )}
  </article>
);

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="mt-4 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
    <p className="font-display text-2xl font-semibold">{title}</p>
    <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">{description}</p>
  </div>
);

export const MyReservations = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationsResponse>({
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadReservations = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        setReservations(await fetchMyReservations());
      } catch (loadError) {
        if (isUnauthorized(loadError)) {
          navigate('/login', { replace: true, state: { from: '/mis-reservas' } });
          return;
        }
        setError(getErrorMessage(loadError));
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void loadReservations(true);
  }, [loadReservations]);

  const handleCancel = async (reservationId: number) => {
    setCancellingId(reservationId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await cancelReservation(reservationId);
      setPendingCancelId(null);
      setSuccessMessage('Reserva cancelada. El bloque vuelve a estar disponible.');
      await loadReservations();
    } catch (cancelError) {
      if (isUnauthorized(cancelError)) {
        navigate('/login', { replace: true, state: { from: '/mis-reservas' } });
        return;
      }
      setActionError(getErrorMessage(cancelError));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Mis reservas</h1>
          <p className="mt-1 text-ink/55">Tus próximos turnos y el historial de horas reservadas.</p>
        </div>

        {reservations.upcoming.length === 0 && (
          <Link
            to="/courts"
            className="inline-flex w-fit rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court motion-reduce:transition-none"
          >
            Reservar una hora
          </Link>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {error && (
          <>
            <Alert>{error}</Alert>
            <button
              type="button"
              onClick={() => void loadReservations(true)}
              className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-court/40 hover:text-ink motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </>
        )}
        {actionError && <Alert>{actionError}</Alert>}
        {successMessage && <Alert tone="success">{successMessage}</Alert>}
      </div>

      {loading ? (
        <Loading label="Cargando tus reservas…" />
      ) : (
        <>
          <section className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold tracking-tight">Próximas</h2>
              <span className="text-sm text-ink/45">
                {reservations.upcoming.length === 1
                  ? '1 reserva'
                  : `${reservations.upcoming.length} reservas`}
              </span>
            </div>

            {reservations.upcoming.length === 0 ? (
              <EmptyState
                title="No tienes reservas futuras"
                description="Elige una cancha y una fecha para asegurar tu próxima hora de juego."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {reservations.upcoming.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    isUpcoming
                    cancellable
                    pendingCancel={pendingCancelId === reservation.id}
                    cancelling={cancellingId === reservation.id}
                    onRequestCancel={() => {
                      setPendingCancelId(reservation.id);
                      setActionError(null);
                      setSuccessMessage(null);
                    }}
                    onDismissCancel={() => setPendingCancelId(null)}
                    onConfirmCancel={() => void handleCancel(reservation.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold tracking-tight">Historial</h2>
              <span className="text-sm text-ink/45">
                {reservations.past.length === 1
                  ? '1 reserva'
                  : `${reservations.past.length} reservas`}
              </span>
            </div>

            {reservations.past.length === 0 ? (
              <EmptyState
                title="Tu historial está vacío"
                description="Aquí verás las reservas que ya pasaron y las que cancelaste."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {reservations.past.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    isUpcoming={false}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
