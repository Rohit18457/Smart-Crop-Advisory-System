import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  CloudSun, 
  Sun, 
  Wind, 
  Droplets, 
  Eye,
  Gauge,
  MapPin,
  RefreshCw,
  Calendar,
  Umbrella,
  Search,
  AlertTriangle
} from 'lucide-react';
import Card from '../components/Common/Card';
import { getWeather, getWeatherForecast } from '../api';

const Weather = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState('Mumbai');
  const [searchInput, setSearchInput] = useState('Mumbai');

  const getWeatherIcon = (main) => {
    const icons = {
      'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
      'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Haze': '🌫️',
      'Fog': '🌫️', 'Smoke': '🌫️', 'Dust': '🌪️', 'Tornado': '🌪️',
    };
    return icons[main] || '⛅';
  };

  const { data: currentWeatherData, isLoading: loadingWeather, isError: isWeatherError, error: weatherError } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const data = await getWeather(city);
      if (!data.success) throw new Error(data.error || 'Failed to fetch weather');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: forecastData, isLoading: loadingForecast, isError: isForecastError, error: forecastError } = useQuery({
    queryKey: ['forecast', city],
    queryFn: async () => {
      const data = await getWeatherForecast(city);
      if (!data.success) throw new Error(data.error || 'Failed to fetch forecast');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const loading = loadingWeather || loadingForecast;
  const isError = isWeatherError || isForecastError;
  const error = isError ? (weatherError?.message || forecastError?.message) : null;

  const currentWeather = useMemo(() => {
    if (!currentWeatherData) return null;
    const w = currentWeatherData.weather;
    return {
      location: `${w.city}, ${w.country}`,
      temperature: Math.round(w.temperature.current),
      condition: w.weather.description.charAt(0).toUpperCase() + w.weather.description.slice(1),
      humidity: w.humidity,
      windSpeed: w.wind.speed,
      pressure: w.pressure,
      visibility: Math.round((w.visibility || 0) / 1000),
      feelsLike: Math.round(w.temperature.feels_like),
      icon: getWeatherIcon(w.weather.main),
      clouds: w.clouds,
    };
  }, [currentWeatherData]);

  const forecast = useMemo(() => {
    if (!forecastData) return [];
    const dailyMap = {};
    forecastData.forecast.forEach((item) => {
      const date = item.datetime.split(' ')[0];
      const hour = parseInt(item.datetime.split(' ')[1].split(':')[0]);
      if (!dailyMap[date] || Math.abs(hour - 12) < Math.abs(parseInt(dailyMap[date].datetime.split(' ')[1].split(':')[0]) - 12)) {
        dailyMap[date] = item;
      }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Object.entries(dailyMap).slice(0, 7).map(([date, item], index) => {
      const d = new Date(date);
      return {
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : days[d.getDay()],
        high: Math.round(item.temperature.max),
        low: Math.round(item.temperature.min),
        condition: item.weather.description.charAt(0).toUpperCase() + item.weather.description.slice(1),
        icon: getWeatherIcon(item.weather.main),
        rain: Math.round((item.rain_3h || 0) * 10),
        humidity: item.humidity,
      };
    });
  }, [forecastData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
    }
  };

  const getWeatherAdvice = (condition, temperature) => {
    if (!condition) return null;
    const lc = condition.toLowerCase();
    if (lc.includes('rain') || lc.includes('drizzle') || lc.includes('thunderstorm')) {
      return { type: 'warning', message: 'Rainfall expected. Ensure proper drainage in fields and postpone spraying activities.', icon: '⚠️' };
    } else if (temperature > 35) {
      return { type: 'danger', message: 'High temperature alert. Increase irrigation frequency and provide shade for livestock.', icon: '🌡️' };
    } else if (lc.includes('clear') || lc.includes('sunny')) {
      return { type: 'success', message: 'Clear weather — perfect for field activities. Good time for harvesting and drying crops.', icon: '✅' };
    }
    return { type: 'info', message: 'Moderate weather conditions. Continue regular farming activities.', icon: 'ℹ️' };
  };

  const weatherAdvice = currentWeather ? getWeatherAdvice(currentWeather.condition, currentWeather.temperature) : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="animate-spin h-8 w-8 text-primary-600" />
        <span className="text-surface-500 font-medium">Loading weather data...</span>
      </div>
    );
  }

  if (error && !currentWeather) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('weather')}</h1>
          <p className="text-surface-500 mt-1">Real-time weather updates and agricultural forecasts</p>
        </div>
        <Card>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter city name..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <div className="text-center py-10">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
            <p className="text-surface-500 text-sm mt-1">Try searching for a different city</p>
          </div>
        </Card>
      </div>
    );
  }

  const weatherStats = currentWeather ? [
    { icon: Droplets, label: 'Humidity', value: `${currentWeather.humidity}%`, bg: 'bg-sky-50', color: 'text-sky-600' },
    { icon: Wind, label: 'Wind Speed', value: `${currentWeather.windSpeed} m/s`, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { icon: Gauge, label: 'Pressure', value: `${currentWeather.pressure} hPa`, bg: 'bg-violet-50', color: 'text-violet-600' },
    { icon: Eye, label: 'Visibility', value: `${currentWeather.visibility} km`, bg: 'bg-amber-50', color: 'text-amber-600' },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('weather')}</h1>
          <p className="text-surface-500 mt-1">Real-time weather updates and agricultural forecasts</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="City name..."
            className="input-field w-40"
          />
          <button type="submit" className="btn-secondary flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>

      {/* Current Weather Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-4 w-4 text-sky-200" />
                <span className="text-sky-100 font-medium">{currentWeather.location}</span>
                <span className="text-xs text-sky-200 ml-auto">Live data</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-5">
                  <span className="text-7xl">{currentWeather.icon}</span>
                  <div>
                    <div className="text-6xl font-extrabold tracking-tighter">{currentWeather.temperature}°</div>
                    <div className="text-sky-100 text-lg font-medium mt-1">{currentWeather.condition}</div>
                    <div className="text-sky-200 text-sm">Feels like {currentWeather.feelsLike}°C</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {weatherStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="h-4 w-4 text-sky-200" />
                          <span className="text-xs text-sky-200">{stat.label}</span>
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Advice */}
        <Card title="Agricultural Advisory" icon={CloudSun} iconBg="bg-sky-100" iconColor="text-sky-600">
          {weatherAdvice && (
            <div className={`alert alert-${weatherAdvice.type} mb-5`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{weatherAdvice.icon}</span>
                <p className="text-sm leading-relaxed">{weatherAdvice.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-bold text-surface-900 text-sm">Today's Recommendations</h4>
            <ul className="space-y-2.5">
              {[
                'Check soil moisture levels',
                'Monitor crop health for disease signs',
                'Plan irrigation schedule based on forecast',
                'Prepare for weather changes'
              ].map((rec, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <Card title="Weather Forecast" icon={Calendar} iconBg="bg-indigo-100" iconColor="text-indigo-600">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {forecast.map((day, index) => (
              <div 
                key={index} 
                className={`text-center p-4 rounded-2xl transition-all duration-200 hover:-translate-y-1 cursor-default
                  ${index === 0 ? 'bg-primary-50 border-2 border-primary-200' : 'bg-surface-50 hover:bg-surface-100 border border-transparent'}
                `}
              >
                <div className="font-semibold text-surface-900 mb-2 text-sm">{day.day}</div>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="text-xs text-surface-500 mb-3">{day.condition}</div>
                <div className="space-y-0.5">
                  <div className="font-bold text-surface-900">{day.high}°</div>
                  <div className="text-sm text-surface-400">{day.low}°</div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <Droplets className="h-3 w-3 text-sky-500" />
                  <span className="text-xs font-semibold text-sky-600">{day.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Alerts & Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Weather Alerts" icon={Umbrella} iconBg="bg-amber-100" iconColor="text-amber-600">
          <div className="space-y-3">
            {currentWeather && currentWeather.humidity > 80 && (
              <div className="alert alert-warning">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>⚠️</span>
                  <span className="font-bold text-sm text-amber-800">High Humidity Alert</span>
                </div>
                <p className="text-sm text-amber-700">Humidity is at {currentWeather.humidity}%. Watch for fungal diseases.</p>
              </div>
            )}
            {currentWeather && currentWeather.windSpeed > 10 && (
              <div className="alert alert-info">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>ℹ️</span>
                  <span className="font-bold text-sm text-sky-800">Wind Advisory</span>
                </div>
                <p className="text-sm text-sky-700">Strong winds ({currentWeather.windSpeed} m/s). Secure equipment and structures.</p>
              </div>
            )}
            {currentWeather && currentWeather.temperature > 35 && (
              <div className="alert alert-danger">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>🌡️</span>
                  <span className="font-bold text-sm text-red-800">Heat Alert</span>
                </div>
                <p className="text-sm text-red-700">Temperature at {currentWeather.temperature}°C. Increase irrigation.</p>
              </div>
            )}
            {currentWeather && currentWeather.humidity <= 80 && currentWeather.windSpeed <= 10 && currentWeather.temperature <= 35 && (
              <div className="alert alert-info">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>✅</span>
                  <span className="font-bold text-sm text-sky-800">All Clear</span>
                </div>
                <p className="text-sm text-sky-700">No weather alerts for your area. Conditions are favorable for farming.</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Farming Calendar" icon={Sun} iconBg="bg-amber-100" iconColor="text-amber-600">
          <div className="space-y-3">
            {[
              { period: 'This Week', advice: `Current temp: ${currentWeather?.temperature}°C. Plan activities around weather conditions.`, color: 'emerald' },
              { period: 'Next Week', advice: 'Monitor crop health and adjust irrigation based on forecast.', color: 'sky' },
              { period: 'Month Ahead', advice: 'Prepare for seasonal transitions and plan crop rotation.', color: 'amber' }
            ].map((item, i) => (
              <div key={i} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-xl p-4`}>
                <h4 className={`font-bold text-${item.color}-800 text-sm mb-1`}>{item.period}</h4>
                <p className={`text-sm text-${item.color}-700`}>{item.advice}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Weather;