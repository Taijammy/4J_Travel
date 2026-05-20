// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const inputCls = `
  w-full px-4 py-3 rounded-xl border border-white/12
  text-sm outline-none placeholder-white/28
  focus:border-accent2 transition-colors
`;
const inputStyle = { background: 'rgba(255,255,255,0.07)', color: '#ffffff' };

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await login(form.email, form.password);
      if (res.success) navigate('/dashboard');
      else setError(res.error || 'Login failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot connect to server. Is the backend running?');
    } finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setLoading(true); setError('');
    try {
      await register('Demo User', 'demo@taskflow.io', 'demo123456');
      const res = await login('demo@taskflow.io', 'demo123456');
      if (res.success) navigate('/dashboard');
      else setError(res.error || 'Demo login failed.');
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ink flex overflow-hidden relative">

      {/* Background orbs */}
      <div className="fixed w-[600px] h-[600px] rounded-full -top-32 -right-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(47,125,232,0.22) 0%, transparent 70%)', filter: 'blur(90px)' }} />
      <div className="fixed w-[500px] h-[500px] rounded-full -bottom-24 left-0 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(232,93,47,0.16) 0%, transparent 70%)', filter: 'blur(90px)' }} />
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col flex-1 max-w-[480px] p-12 relative z-10">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-black text-white text-lg">✦</div>
          <span className="font-syne font-extrabold text-white text-lg">TaskFlow</span>
        </div>
        <div className="flex-1 flex flex-col justify-center py-10">
          <h1 className="font-syne font-extrabold text-white leading-tight tracking-tight mb-5"
              style={{ fontSize: 'clamp(34px, 3.8vw, 50px)' }}>
            Manage tasks.<br />
            <span className="text-accent">Ship faster.</span>
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>
            A clean, focused workspace to track everything your team is building — from backlog to done.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { icon: '⊞', label: 'Unified dashboard overview' },
            { icon: '◔', label: 'Priority & status tracking' },
            { icon: '✓', label: 'Real-time progress updates' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {f.icon}
              </span>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10"
           style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-full max-w-[400px] rounded-2xl p-9"
             style={{
               background: 'rgba(255,255,255,0.06)',
               border: '1px solid rgba(255,255,255,0.11)',
               backdropFilter: 'blur(24px)',
               boxShadow: '0 24px 64px rgba(0,0,0,0.35)'
             }}>

          <h2 className="font-syne font-extrabold text-white text-2xl tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sign in to your workspace
          </p>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm"
                 style={{ background: 'rgba(232,93,47,0.15)', border: '1px solid rgba(232,93,47,0.3)', color: '#ff8c6b' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         font-syne font-bold text-sm tracking-wide text-white
                         transition-all hover:-translate-y-0.5
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-1"
              style={{ background: '#e85d2f' }}
            >
              {loading ? <Spinner /> : <><span>Sign In</span><span>→</span></>}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Demo button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium
                       flex items-center justify-center gap-2 mb-5
                       transition-colors disabled:opacity-70"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            ⚡ Demo Account
          </button>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#2f7de8' }}>
              Create one free
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;