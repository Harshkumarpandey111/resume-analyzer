import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Registration failed');
    }
    setLoading(false);
  };

  const fields = [
    { label: 'Full Name',  key: 'name',     type: 'text',     ph: 'Harsh Kumar Pandey' },
    { label: 'Email',      key: 'email',    type: 'email',    ph: 'you@example.com' },
    { label: 'Password',   key: 'password', type: 'password', ph: '••••••••' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', zIndex: 1
    }}>
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', background: 'rgba(59,130,246,0.06)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(167,139,250,0.3)'
          }}>🚀</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '28px',
            fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px',
            background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Create account</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Start analyzing your resume with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {fields.map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" type={type} placeholder={ph}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '6px', padding: '14px' }}>
            {loading
              ? <><span className="spinning">⚙️</span> Creating...</>
              : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#475569', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: '700' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}