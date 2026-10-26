import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Navbar } from './components/Navbar';
import { Booking } from './pages/Booking';
import { Courts } from './pages/Courts';
import { Login } from './pages/Login';
import { MyReservations } from './pages/MyReservations';
import { Register } from './pages/Register';

export const App = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />

    <main className="mx-auto w-full max-w-6xl flex-1 px-4">
      <Routes>
        <Route path="/" element={<Navigate to="/courts" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courts" element={<Courts />} />
        <Route
          path="/booking/:courtId"
          element={
            <AuthGuard>
              <Booking />
            </AuthGuard>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <AuthGuard>
              <MyReservations />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/courts" replace />} />
      </Routes>
    </main>

    <footer className="border-t border-line/70 py-6 text-center text-xs text-ink/40">
      Pádel Club · Reserva en línea, pago en el club.
    </footer>
  </div>
);
