import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Sprout, 
  Bug, 
  CloudSun, 
  TrendingUp,
  Leaf,
  Users,
  Award,
  Globe,
  Mic,
  Shield,
  Zap,
  ChevronRight,
  Star
} from 'lucide-react';
import LanguageSwitcher from '../components/Common/LanguageSwitcher';

const HomePage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sprout,
      title: t('aiAdvisory'),
      description: t('aiAdvisoryDesc'),
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: Bug,
      title: t('diseaseDetectionTitle'),
      description: t('diseaseDetectionDesc'),
      color: 'from-orange-500 to-red-600',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: CloudSun,
      title: t('weatherMonitoring'),
      description: t('weatherMonitoringDesc'),
      color: 'from-sky-500 to-blue-600',
      bg: 'bg-sky-50',
      iconColor: 'text-sky-600'
    },
    {
      icon: TrendingUp,
      title: t('marketInsights'),
      description: t('marketInsightsDesc'),
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Farmers', suffix: '' },
    { icon: Leaf, value: '50+', label: 'Crop Types', suffix: '' },
    { icon: Award, value: '95%', label: 'Accuracy Rate', suffix: '' },
    { icon: Globe, value: '3', label: 'Languages', suffix: '' }
  ];

  const capabilities = [
    { icon: Mic, title: 'Voice Assistant', desc: 'Ask questions in your language' },
    { icon: Shield, title: 'Data Security', desc: 'Your farm data stays private' },
    { icon: Zap, title: 'Instant Results', desc: 'AI analysis in seconds' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ──── Header ──── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">AgriSmart</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                to="/login"
                className="btn-ghost text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-btn"
                className="btn-primary text-sm flex items-center gap-2"
              >
                {t('getStarted')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ──── Hero Section ──── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-accent-50/40" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-200/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary-700">AI-Powered Agriculture Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-surface-900 mb-6 leading-[1.1] animate-fade-in tracking-tight">
            {t('heroTitle').split(' ').slice(0, 2).join(' ')}
            <span className="text-gradient from-primary-600 to-primary-400 block sm:inline">
              {' '}{t('heroTitle').split(' ').slice(2).join(' ')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-surface-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in stagger-1">
            {t('heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-2">
            <Link
              to="/register"
              id="hero-cta-btn"
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-lg"
            >
              {t('getStarted')}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="btn-secondary text-base px-8 py-3.5 inline-flex items-center justify-center gap-2"
            >
              {t('learnMore')}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Capabilities pills */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 animate-fade-in stagger-3">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-card border border-surface-100">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-surface-900">{cap.title}</p>
                    <p className="text-xs text-surface-500">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──── Stats Section ──── */}
      <section className="py-16 bg-white border-y border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-surface-900 mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-surface-500 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──── Features Section ──── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-success mb-4">✨ Key Features</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-surface-900 mb-4 tracking-tight">
              Powerful Features for<br className="hidden sm:block" /> Modern Farming
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to make informed decisions and maximize your agricultural productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-white rounded-2xl p-7 border border-surface-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bg} rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">{feature.title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-5 flex items-center text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──── Testimonials ──── */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 mb-4 tracking-tight">
              Trusted by Thousands of Farmers
            </h2>
            <p className="text-lg text-surface-500">Real results from real farmers across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Kumar', location: 'Punjab', quote: 'AgriSmart helped me increase my wheat yield by 30%. The crop recommendations are spot-on!', crop: '🌾' },
              { name: 'Priya Sharma', location: 'Maharashtra', quote: 'The disease detection feature saved my entire grape vineyard. Detected a fungal infection early.', crop: '🍇' },
              { name: 'Amit Modi', location: 'Gujarat', quote: 'Market price alerts help me sell my cotton at the best prices. Increased my profits by 25%.', crop: '🏗️' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-surface-50 rounded-2xl p-7 border border-surface-100 hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-surface-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-surface-500">{testimonial.location}</p>
                  </div>
                  <span className="ml-auto text-2xl">{testimonial.crop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA Section ──── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 animate-gradient-bg" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to Transform<br />Your Farming?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of farmers who are already using AI to increase their yields and profits
          </p>
          <Link
            to="/register"
            id="cta-bottom-btn"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl 
              hover:bg-primary-50 transition-all duration-200 shadow-premium hover:shadow-xl text-lg"
          >
            Start Your Journey
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="bg-surface-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AgriSmart</span>
              </div>
              <p className="text-surface-400 mb-6 max-w-sm leading-relaxed">
                Empowering farmers with AI-driven insights for sustainable and profitable agriculture.
              </p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'YouTube'].map((social) => (
                  <button key={social} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-surface-400 hover:text-white transition-all">
                    {social}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-surface-200">Features</h4>
              <ul className="space-y-3">
                {['Crop Recommendation', 'Disease Detection', 'Weather Monitoring', 'Market Prices', 'Voice Assistant'].map(item => (
                  <li key={item}>
                    <Link to="/app" className="text-surface-400 hover:text-primary-400 transition-colors text-sm">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-surface-200">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'Documentation', 'Community', 'API Access'].map(item => (
                  <li key={item}>
                    <button className="text-surface-400 hover:text-primary-400 transition-colors text-sm">{item}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-surface-500 text-sm">&copy; 2026 AgriSmart. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-surface-500">
              <button className="hover:text-surface-300 transition-colors">Privacy Policy</button>
              <button className="hover:text-surface-300 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;