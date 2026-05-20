// src/pages/Register.jsx
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

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim())              return 'Name is required.';
    if (form.name.trim().length < 2)    return 'Name must be at least 2 characters.';
    if (!form.email)                    return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password)                 return 'Password is required.';
    if (form.password.length < 6)       return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const res = await register(form.name.trim(), form.email, form.password);
      if (res.success) navigate('/dashboard');
      else setError(res.error || 'Registration failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot connect to server. Is the backend running?');
    } finally { setLoading(false); }
  };

  /* Password strength */
  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6)          s++;
    if (pw.length >= 10)         s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strengthInfo = [
    { label: 'Too weak', color: '#e85d2f' },
    { label: 'Weak',     color: '#f5a623' },
    { label: 'Fair',     color: '#f5d623' },
    { label: 'Good',     color: '#2ec47a' },
    { label: 'Strong',   color: '#2f7de8' },
  ];
  const strength = form.password ? getStrength(form.password) : -1;
  const sInfo    = strength >= 0 ? strengthInfo[Math.min(strength, 4)] : null;

  return (
    <div className="min-h-screen bg-ink flex overflow-hidden relative">

      {/* Background orbs */}
      <div className="fixed w-[600px] h-[600px] rounded-full -top-32 -right-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(47,125,232,0.22) 0%, transparent 70%)', filter: 'blur(90px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full -bottom-20 left-0 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(232,93,47,0.16) 0%, transparent 70%)', filter: 'blur(90px)' }} />
      <div className="fixed inset-0 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 max-w-[480px] p-12 relative z-10">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-black text-white text-lg">✦</div>
          <span className="font-syne font-extrabold text-white text-lg">TaskFlow</span>
        </div>
        <div className="flex-1 flex flex-col justify-center py-10">
          <h1 className="font-syne font-extrabold text-white leading-tight tracking-tight mb-5"
              style={{ fontSize: 'clamp(34px, 3.8vw, 50px)' }}>
            Start for free.<br />
            <span className="text-accent">Build faster.</span>
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Create your account in seconds and start managing tasks with your team right away.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { icon: '🔒', label: 'Secure JWT authentication' },
            { icon: '⚡', label: 'Instant task creation' },
            { icon: '📊', label: 'Real-time dashboard stats' },
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
        <div className="w-full max-w-[420px] rounded-2xl p-9"
             style={{
               background: 'rgba(255,255,255,0.06)',
               border: '1px solid rgba(255,255,255,0.11)',
               backdropFilter: 'blur(24px)',
               boxShadow: '0 24px 64px rgba(0,0,0,0.35)'
             }}>

          <h2 className="font-syne font-extrabold text-white text-2xl tracking-tight mb-1">
            Create account
          </h2>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Fill in your details to get started
          </p>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm"
                 style={{ background: 'rgba(232,93,47,0.15)', border: '1px solid rgba(232,93,47,0.3)', color: '#ff8c6b' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className={inputCls}
                style={inputStyle}
              />
            </div>

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
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className={inputCls}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && sInfo && (
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden mb-1"
                       style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((Math.min(strength, 4) + 1) / 5) * 100}%`,
                        background: sInfo.color
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: sInfo.color }}>{sInfo.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={inputCls}
                style={inputStyle}
              />
              {/* Match indicator */}
              {form.confirm && (
                <p className="text-xs mt-1" style={{
                  color: form.password === form.confirm ? '#2ec47a' : '#e85d2f'
                }}>
                  {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         font-syne font-bold text-sm tracking-wide text-white
                         transition-all hover:-translate-y-0.5 mt-2
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: '#e85d2f' }}
            >
              {loading ? <Spinner /> : <><span>Create Account</span><span>→</span></>}
            </button>

          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#2f7de8' }}>
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;