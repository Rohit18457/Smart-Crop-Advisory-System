import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  CloudSun, 
  Sprout, 
  IndianRupee, 
  AlertTriangle,
  TrendingUp,
  Droplets,
  Thermometer,
  Wind,
  Bug,
  BarChart3,
  Calendar,
  Leaf,
  RefreshCw
} from 'lucide-react';
import Card from '../components/Common/Card';
import { getWeather, getMarketPrices } from '../api';
import { supabase } from '../supabase';

const Dashboard = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [weatherData, setWeatherData] = useState(null);
  const [marketToppers, setMarketToppers] = useState([]);
  const [dbAlerts, setDbAlerts] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars

  // Get city from profile location (e.g. "Pune, Maharashtra, India" → "Pune")
  const userCity = profile?.location?.split(',')[0]?.trim() || 'Mumbai';
  const userName = profile?.full_name?.split(' ')[0] || 'Farmer';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCity]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Fetch weather
    try {
      const wRes = await getWeather(userCity);
      if (wRes.success) {
        const w = wRes.weather;
        setWeatherData({
          temperature: Math.round(w.temperature.current),
          humidity: w.humidity,
          windSpeed: w.wind.speed,
          condition: w.weather.description.charAt(0).toUpperCase() + w.weather.description.slice(1),
          icon: getWeatherIcon(w.weather.main),
          city: w.city,
        });
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    }

    // 2. Fetch market prices
    try {
      const mRes = await getMarketPrices();
      if (mRes.success && mRes.market_data) {
        const items = mRes.market_data.map(i => ({
          name: i.commodity || i.crop || 'Unknown',
          price: i.modal_price || i.price || 0,
          unit: i.unit || 'per quintal',
          market: i.market || '',
          state: i.state || '',
          trend: i.trend || null,
          change: i.change || null,
        }));
        const sorted = items.sort((a, b) => b.price - a.price).slice(0, 3);
        setMarketToppers(sorted);
      }
    } catch (err) {
      console.error('Market fetch error:', err);
    }

    // 3. Fetch live Admin Alerts
    try {
      const { data: alertsData, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      if (alertsData) setDbAlerts(alertsData);
    } catch (err) {
      console.error('Alerts fetch error:', err);
    }

    setLoading(false);
  };

  const getWeatherIcon = (main) => {
    const icons = {
      'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
      'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Haze': '🌫️',
    };
    return icons[main] || '⛅';
  };

  const quickLinks = [
    { icon: Sprout, label: 'Get Crop Advice', href: '/app/crop-recommendation', color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-100' },
    { icon: Bug, label: 'Disease Check', href: '/app/disease-detection', color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-100' },
    { icon: TrendingUp, label: 'Market Prices', href: '/app/market-prices', color: 'text-violet-600', bg: 'bg-violet-50', hoverBg: 'hover:bg-violet-100' },
    { icon: CloudSun, label: 'Weather Report', href: '/app/weather', color: 'text-sky-600', bg: 'bg-sky-50', hoverBg: 'hover:bg-sky-100' },
  ];

  const alerts = [
    { type: 'warning', message: weatherData && weatherData.humidity > 70 
        ? `High humidity (${weatherData.humidity}%) — Monitor for fungal diseases` 
        : 'Monitor soil moisture levels regularly', 
      time: 'Live' },
    { type: 'info', message: 'Use crop recommendation tool for optimal planting advice', time: 'Tip' },
    { type: 'success', message: 'All backend services are operational', time: 'System' }
  ];

  const getAlertStyle = (type) => {
    switch (type) {
      case 'warning': return { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: '⚠️', text: 'text-amber-800' };
      case 'info': return { border: 'border-l-sky-500', bg: 'bg-sky-50', icon: 'ℹ️', text: 'text-sky-800' };
      case 'success': return { border: 'border-l-emerald-500', bg: 'bg-emerald-50', icon: '✅', text: 'text-emerald-800' };
      default: return { border: 'border-l-surface-500', bg: 'bg-surface-50', icon: 'ℹ️', text: 'text-surface-800' };
    }
  };

  const displayWeather = weatherData || {
    temperature: '--', humidity: '--', windSpeed: '--', condition: 'Loading...', icon: '⛅'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 rounded-2xl p-8 text-white shadow-glow-lg animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl md:text-3xl font-bold">{t('welcomeBack')}, {userName}!</h1>
          </div>
          <p className="text-primary-100 text-lg mt-2">Here's what's happening with your farm today</p>
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-medium">{weatherData ? `${weatherData.city} — ${weatherData.condition}` : 'Loading weather...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Weather Card */}
        <div className="stat-card animate-fade-in stagger-1" style={{ '--stat-color': '#0ea5e9' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl">
                <CloudSun className="h-5 w-5 text-sky-600" />
              </div>
              <p className="text-sm font-semibold text-surface-600">{t('todaysWeather')}</p>
            </div>
            <span className="text-2xl">{displayWeather.icon}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm text-surface-600">Temperature</span>
              </div>
              <span className="font-bold text-surface-900">{displayWeather.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-surface-600">Humidity</span>
              </div>
              <span className="font-bold text-surface-900">{displayWeather.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-surface-500" />
                <span className="text-sm text-surface-600">Wind</span>
              </div>
              <span className="font-bold text-surface-900">{displayWeather.windSpeed} m/s</span>
            </div>
          </div>
        </div>

        {/* Recommended Crop Card */}
        <div className="stat-card animate-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Sprout className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-surface-600">{t('recommendedCrop')}</p>
          </div>
          <div className="text-center py-2">
            <h3 className="text-xl font-extrabold text-primary-600 mb-1">AI Crop Advisor</h3>
            <p className="text-sm text-surface-500 mb-4">Enter your soil data to get recommendations</p>
            <Link to="/app/crop-recommendation" className="btn-primary w-full inline-block text-center py-2.5">
              Get Recommendation
            </Link>
          </div>
        </div>

        {/* Market Price Card */}
        <div className="stat-card animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-violet-100 rounded-xl">
              <IndianRupee className="h-5 w-5 text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-surface-600">{t('currentPrice')}</p>
          </div>
          <div className="text-center py-2">
            {marketToppers.length > 0 ? (
              <>
                <h3 className="text-3xl font-extrabold text-surface-900 mb-0.5">₹{marketToppers[0].price.toLocaleString()}</h3>
                <p className="text-sm text-surface-500 mb-4">{marketToppers[0].name} — {marketToppers[0].unit}</p>
                <div className="flex items-center justify-center gap-2 bg-emerald-50 rounded-xl py-2.5 px-4">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Top Price</span>
                  <span className="text-xs text-surface-500">{marketToppers[0].market || 'market'}</span>
                </div>
              </>
            ) : (
              <p className="text-surface-500">Loading prices...</p>
            )}
          </div>
        </div>

        {/* Alerts Card */}
        <div className="stat-card animate-fade-in stagger-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-surface-600">{t('alerts')}</p>
            </div>
            <span className="badge badge-warning">Live</span>
          </div>
          <div className="space-y-2.5">
            {dbAlerts.length > 0 ? (
              dbAlerts.map((alert, index) => {
                const isWarning = alert.title?.toLowerCase().includes('warn') || alert.title?.toLowerCase().includes('alert');
                const style = getAlertStyle(isWarning ? 'warning' : 'info');
                return (
                  <div key={alert.id || index} className={`border-l-4 ${style.border} ${style.bg} p-2.5 rounded-r-xl`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-surface-900 mb-0.5">{alert.title}</p>
                        <p className="text-xs text-surface-700 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-surface-400 mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              alerts.slice(0, 2).map((alert, index) => {
                const style = getAlertStyle(alert.type);
                return (
                  <div key={index} className={`border-l-4 ${style.border} ${style.bg} p-2.5 rounded-r-xl`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-700 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-surface-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top Market Movers */}
        <div className="lg:col-span-3">
          <Card title="Top Market Movers" icon={TrendingUp} iconBg="bg-emerald-100" iconColor="text-emerald-600">
            <div className="space-y-0">
              {marketToppers.length > 0 ? marketToppers.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3.5 border-b border-surface-100 last:border-0 last:pb-0 first:pt-0">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl w-8 text-center">🌱</span>
                    <div>
                      <p className="font-semibold text-surface-900 capitalize">{item.name}</p>
                      <p className="text-sm text-surface-500">₹{item.price.toLocaleString()} {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl py-1.5 px-3">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold text-sm">{item.market || 'Top'}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <RefreshCw className="animate-spin h-6 w-6 text-surface-400 mx-auto mb-2" />
                  <p className="text-surface-500 text-sm">Loading market data...</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card title="Quick Actions" icon={BarChart3} iconBg="bg-violet-100" iconColor="text-violet-600">
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`flex flex-col items-center gap-3 p-5 ${item.bg} rounded-2xl ${item.hoverBg} transition-all duration-200 group hover:-translate-y-0.5`}
                  >
                    <Icon className={`h-7 w-7 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                    <p className="text-sm font-semibold text-surface-700 text-center">{item.label}</p>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;