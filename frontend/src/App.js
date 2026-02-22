import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs      from './pages/Jobs';
import Admin     from './pages/Admin';
import Navbar    from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: '#00e5a0', padding: 40 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jobs"      element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
      <ToastContainer theme="dark" position="top-right" />
    </BrowserRouter>
  );
}