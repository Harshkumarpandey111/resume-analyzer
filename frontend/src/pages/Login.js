import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', zIndex: 1
    }}>
      {/* Glow behind card */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', background: 'rgba(110,231,183,0.06)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(110,231,183,0.3)'
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '28px',
            fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px',
            background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Sign in to your ResumeAI account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '6px', padding: '14px' }}>
            {loading
              ? <><span className="spinning">⚙️</span> Signing in...</>
              : '⚡ Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#475569', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
          No account?{' '}
          <Link to="/register" style={{
            color: '#6ee7b7', textDecoration: 'none',
            fontWeight: '700'
          }}>Create one free →</Link>
        </p>
      </div>
    </div>
  );
}