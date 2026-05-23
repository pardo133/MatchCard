import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { useUserStore }   from './store/userStore';
import Navbar     from './components/common/Navbar';
import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Profile    from './pages/Profile';
import MisRepes   from './pages/MisRepes';
import Album      from './pages/Album';
import Admin      from './pages/Admin';
import Descubrir    from './pages/Descubrir';
import Chat         from './pages/Chat';
import QuienesSomos from './pages/QuienesSomos';

function PrivateRoute({ children }) {
  const token = useUserStore(state => state.token);
  return token ? children : <Navigate to="/login" replace />;
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
        <Navbar />
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/quienes-somos"   element={<QuienesSomos />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/repes"      element={<PrivateRoute><MisRepes /></PrivateRoute>} />
          <Route path="/album"      element={<PrivateRoute><Album /></PrivateRoute>} />
          <Route path="/descubrir"  element={<PrivateRoute><Descubrir /></PrivateRoute>} />
          <Route path="/chat/:id"   element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/admin"      element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}
