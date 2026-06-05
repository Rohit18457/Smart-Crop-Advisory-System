import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, MapPin, Globe, Phone, Layers, CheckCircle } from 'lucide-react';

const SOIL_TYPES = [
  { value: '', label: 'Select soil type' },
  { value: 'alluvial', label: 'Alluvial Soil' },
  { value: 'black', label: 'Black (Cotton) Soil' },
  { value: 'red', label: 'Red Soil' },
  { value: 'laterite', label: 'Laterite Soil' },
  { value: 'sandy', label: 'Sandy Soil' },
  { value: 'clay', label: 'Clay Soil' },
  { value: 'loamy', label: 'Loamy Soil' },
  { value: 'saline', label: 'Saline Soil' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    soilType: '', location: '', preferredLanguage: 'en', phone: '',
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  const nameRegex = /^[A-Za-z\s.'-]+$/;

  const passwordChecks = {
    length: form.password.length >= 6,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const resp = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await resp.json();
          const loc = [data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', ');
          setForm(prev => ({ ...prev, location: loc || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        } catch {
          setForm(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
        } finally { setDetectingLocation(false); }
      },
      () => { setError('Location access denied. Please enter manually.'); setDetectingLocation(false); }
    );
  };

  const validateStep1 = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
    else if (form.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters.';
    else if (!nameRegex.test(form.fullName.trim())) errors.fullName = 'Name can only contain letters, spaces, dots and hyphens.';

    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!emailRegex.test(form.email.trim())) errors.email = 'Please enter a valid email address.';

    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';

    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (form.phone && !phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Indian phone number (e.g. +91 98765 43210).';
    }
    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below.');
      return;
    }
    setFieldErrors({});
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
      setFieldErrors(step2Errors);
      setError('Please fix the errors below.');
      return;
    }
    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const data = await register({
        email: form.email, password: form.password, fullName: form.fullName,
        soilType: form.soilType, location: form.location,
        preferredLanguage: form.preferredLanguage, phone: form.phone,
      });
      
      if (data?.session) {
        navigate('/app', { replace: true });
      } else {
        setIsRegistered(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-primary-600 to-teal-600 animate-gradient-bg" />
        <div className="absolute top-16 right-12 w-24 h-24 bg-white/10 rounded-3xl rotate-12 animate-float" />
        <div className="absolute bottom-24 left-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '3s' }} />
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
            Join the Smart<br />Farming Revolution
          </h1>
          <p className="text-primary-100 text-lg mb-12 max-w-md leading-relaxed">
            Create your free account and get personalized crop advice, disease detection, and market insights.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: '50+', label: 'Crop Types' },
              { val: '95%', label: 'Accuracy' },
              { val: '39', label: 'Diseases Detected' },
              { val: '3', label: 'Languages' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-white">{s.val}</div>
                <div className="text-xs text-primary-200 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-surface-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">AgriSmart</span>
          </div>

          {isRegistered ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow border border-emerald-100 animate-pulse">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-3">Verify Your Email ✉️</h2>
              <p className="text-surface-600 mb-6 text-base leading-relaxed">
                Registration successful! We have sent a confirmation link to:
                <span className="block font-bold text-emerald-700 mt-1.5 break-all">{form.email}</span>
              </p>
              <div className="bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 mb-8 text-left text-sm text-emerald-800 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <span className="text-base">📌</span> What's next?
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-emerald-700 leading-relaxed">
                  <li>Open your email client and find the verification email.</li>
                  <li>Click the confirmation link to activate your AgriSmart account.</li>
                  <li>After verifying, return to AgriSmart and sign in.</li>
                </ul>
              </div>
              <button 
                onClick={() => navigate('/login')} 
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 group shadow-glow"
              >
                Go to Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-6 text-sm text-surface-400">
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight mb-2">Create Account</h2>
              <p className="text-surface-500 mb-6">Step {step} of 2 — {step === 1 ? 'Account Details' : 'Farm Profile'}</p>

              {/* Progress bar */}
              <div className="flex gap-2 mb-6">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary-500' : 'bg-surface-200'}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary-500' : 'bg-surface-200'}`} />
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-scale-in">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div>
                      <label htmlFor="reg-name" className="block text-sm font-semibold text-surface-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-name" name="fullName" type="text" value={form.fullName} onChange={handleChange} className={`input-field pl-12 ${fieldErrors.fullName ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="Rajesh Kumar" />
                      </div>
                      {fieldErrors.fullName && <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                      <label htmlFor="reg-email" className="block text-sm font-semibold text-surface-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} className={`input-field pl-12 ${fieldErrors.email ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="farmer@example.com" />
                      </div>
                      {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="reg-password" className="block text-sm font-semibold text-surface-700 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className={`input-field pl-12 pr-12 ${fieldErrors.password ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="Min. 6 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                      {form.password && (
                        <div className="mt-2 space-y-1">
                          <p className={`text-xs flex items-center gap-1 ${passwordChecks.length ? 'text-emerald-600' : 'text-surface-400'}`}>
                            {passwordChecks.length ? '✓' : '○'} At least 6 characters
                          </p>
                          <p className={`text-xs flex items-center gap-1 ${passwordChecks.uppercase ? 'text-emerald-600' : 'text-surface-400'}`}>
                            {passwordChecks.uppercase ? '✓' : '○'} One uppercase letter
                          </p>
                          <p className={`text-xs flex items-center gap-1 ${passwordChecks.number ? 'text-emerald-600' : 'text-surface-400'}`}>
                            {passwordChecks.number ? '✓' : '○'} One number
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="reg-confirm" className="block text-sm font-semibold text-surface-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className={`input-field pl-12 ${fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="••••••••" />
                      </div>
                      {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
                    </div>
                    <button type="button" onClick={handleNextStep} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
                      Next: Farm Profile <ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label htmlFor="reg-soil" className="block text-sm font-semibold text-surface-700 mb-1.5">Soil Type</label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <select id="reg-soil" name="soilType" value={form.soilType} onChange={handleChange} className="input-field pl-12 appearance-none cursor-pointer">
                          {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reg-location" className="block text-sm font-semibold text-surface-700 mb-1.5">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-location" name="location" type="text" value={form.location} onChange={handleChange} className="input-field pl-12 pr-28" placeholder="e.g. Pune, Maharashtra" />
                        <button type="button" onClick={detectLocation} disabled={detectingLocation} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                          {detectingLocation ? 'Detecting...' : '📍 Auto'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reg-lang" className="block text-sm font-semibold text-surface-700 mb-1.5">Preferred Language</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <select id="reg-lang" name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange} className="input-field pl-12 appearance-none cursor-pointer">
                          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reg-phone" className="block text-sm font-semibold text-surface-700 mb-1.5">Phone <span className="text-surface-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                        <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={`input-field pl-12 ${fieldErrors.phone ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="+91 98765 43210" />
                      </div>
                      {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-secondary flex-1 py-3">Back</button>
                      <button type="submit" id="register-submit-btn" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>) : (<>Create Account<ArrowRight className="h-5 w-5" /></>)}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <p className="mt-6 text-center text-surface-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Sign In</Link>
              </p>
              <p className="mt-3 text-center">
                <Link to="/" className="text-sm text-surface-400 hover:text-surface-600 transition-colors">← Back to Home</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
