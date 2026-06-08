import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }      from 'react-hot-toast';
import { SocketProvider }      from './context/SocketContext';
import { useUserStore }        from './store/userStore';
import axiosClient             from './api/axiosClient';
import Navbar                  from './components/common/Navbar';
import CookieBanner            from './components/common/CookieBanner';
import Home                    from './pages/Home';
import Login                   from './pages/Login';
import Register                from './pages/Register';
import ForgotPassword          from './pages/ForgotPassword';
import ResetPassword           from './pages/ResetPassword';
import VerifyEmail             from './pages/VerifyEmail';
import VerifyEmailPendiente    from './pages/VerifyEmailPendiente';
import Profile                 from './pages/Profile';
import MisRepes                from './pages/MisRepes';
import Album                   from './pages/Album';
import Admin                   from './pages/Admin';
import Buscador                from './pages/Buscador';
import Dashboard               from './pages/Dashboard';
import Descubrir               from './pages/Descubrir';
import Chat                    from './pages/Chat';
import QuienesSomos            from './pages/QuienesSomos';

function PrivateRoute({ children }) {
  const token = useUserStore(state => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function AuthSync() {
  const { token, setUser, logout } = useUserStore();

  useEffect(() => {
    if (!token) return;
    axiosClient.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => logout());
  }, [token]);

  return null;
}

function ThemeSync() {
  const isPremium = useUserStore(state => state.user?.isPremium);

  useEffect(() => {
    if (isPremium) {
      document.body.classList.add('pro-theme');
    } else {
      document.body.classList.remove('pro-theme');
    }
    return () => document.body.classList.remove('pro-theme');
  }, [isPremium]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1e1b4b',
              border: '1px solid #ddd6fe',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(91,33,182,0.12)',
            },
          }}
        />
        <AuthSync />
        <ThemeSync />
        <Navbar />
        <Routes>
          
          <Route path="/"                        element={<Home />} />
          <Route path="/quienes-somos"           element={<QuienesSomos />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"                element={<Register />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />
          <Route path="/reset-password/:token"   element={<ResetPassword />} />
          <Route path="/verify-email/:token"     element={<VerifyEmail />} />

          
          <Route path="/verificar-email-pendiente"
            element={<PrivateRoute><VerifyEmailPendiente /></PrivateRoute>} />

          
          <Route path="/profile"  element={<PrivateRoute><Profile  /></PrivateRoute>} />
          <Route path="/repes"    element={<PrivateRoute><MisRepes /></PrivateRoute>} />
          <Route path="/album"    element={<PrivateRoute><Album    /></PrivateRoute>} />
          <Route path="/buscador"    element={<PrivateRoute><Buscador   /></PrivateRoute>} />
          <Route path="/dashboard"   element={<PrivateRoute><Dashboard  /></PrivateRoute>} />
          <Route path="/descubrir"   element={<PrivateRoute><Descubrir  /></PrivateRoute>} />
          <Route path="/chat/:id"    element={<PrivateRoute><Chat       /></PrivateRoute>} />
          <Route path="/admin"       element={<PrivateRoute><Admin      /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CookieBanner />
      </SocketProvider>
    </BrowserRouter>
  );
}
