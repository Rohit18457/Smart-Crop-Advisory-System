import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sprout, CloudSun, TrendingUp } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const from = location.state?.from?.pathname || '/app';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally { setLoading(false); }
  };

  const features = [
    { icon: Sprout, text: 'AI Crop Recommendations' },
    { icon: CloudSun, text: 'Real-time Weather Alerts' },
    { icon: TrendingUp, text: 'Market Price Tracking' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-600 animate-gradient-bg" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">AgriSmart</span>
              <span className="block text-xs text-primary-200 font-medium uppercase tracking-widest">AI Platform</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Smart Farming<br />Starts Here
          </h1>
          <p className="text-primary-100 text-lg mb-12 max-w-md leading-relaxed">
            AI-powered insights to help you grow better crops, detect diseases early, and maximize your profits.
          </p>
          <div className="space-y-4">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 text-white/90">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-surface-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">AgriSmart</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight mb-2">Welcome back</h2>
          <p className="text-surface-500 mb-8">Sign in to access your farming dashboard</p>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-scale-in">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className="input-field pl-12" placeholder="farmer@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={handleChange} className="input-field pl-12 pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" id="login-submit-btn" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="h-5 w-5" /></>)}
            </button>
          </form>

          <p className="mt-8 text-center text-surface-500">
            Don't have an account?{' '}
            <Link to="/register" id="go-to-register-link" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Create Account</Link>
          </p>
          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-surface-400 hover:text-surface-600 transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
