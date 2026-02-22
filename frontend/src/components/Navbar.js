import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('See you soon! 👋');
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
    { to: '/jobs',      label: 'Jobs',      icon: '💼' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: '🛡️' }] : [])
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(6,8,24,0.8)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 48px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px'
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 4px 12px rgba(110,231,183,0.3)'
          }}>⚡</div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: '800',
            fontSize: '18px', color: '#f1f5f9', letterSpacing: '-0.5px'
          }}>ResumeAI</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {links.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                textDecoration: 'none',
                padding: '7px 16px', borderRadius: '10px',
                fontSize: '13px', fontWeight: '600',
                color: isActive ? '#6ee7b7' : '#94a3b8',
                background: isActive ? 'rgba(110,231,183,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(110,231,183,0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span>{icon}</span> {label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: '#030712'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
              {user?.name?.split(' ')[0]}
            </span>
            {user?.role === 'admin' && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '6px',
                background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                border: '1px solid rgba(167,139,250,0.25)', fontWeight: '700',
                letterSpacing: '0.5px'
              }}>ADMIN</span>
            )}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="btn btn-ghost" style={{
            padding: '7px 16px', fontSize: '13px'
          }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}