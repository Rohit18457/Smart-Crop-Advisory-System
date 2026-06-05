import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw,
  Calendar,
  IndianRupee,
  BarChart3,
  Bell,
  MapPin,
  Wifi,
  WifiOff
} from 'lucide-react';
import Card from '../components/Common/Card';
import { getMarketPrices } from '../api';

const CROP_EMOJIS = {
  rice: '🍚', wheat: '🌾', maize: '🌽', cotton: '🏵️', sugarcane: '🎋',
  jute: '🧵', coffee: '☕', tea: '🍵', mango: '🥭', banana: '🍌',
  apple: '🍎', grapes: '🍇', watermelon: '🍉', muskmelon: '🍈',
  orange: '🍊', papaya: '🫐', coconut: '🥥', pomegranate: '🫐',
  lentil: '🫘', chickpea: '🫘', kidneybeans: '🫘', pigeonpeas: '🫘',
  mothbeans: '🫘', mungbean: '🫘', blackgram: '🫘',
  onion: '🧅', potato: '🥔', tomato: '🍅', garlic: '🧄',
  paddy: '🍚', jowar: '🌾', bajra: '🌾', ragi: '🌾',
  soyabean: '🫘', groundnut: '🥜', mustard: '🌿',
};

const MarketPrices = () => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    fetchMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (stateFilter) params.state = stateFilter;

      const data = await getMarketPrices(params);
      if (data.success) {
        const items = data.market_data.map((item, index) => {
          const commodityLower = (item.commodity || '').toLowerCase();
          return {
            id: index + 1,
            name: item.commodity || 'Unknown',
            cropKey: commodityLower,
            emoji: CROP_EMOJIS[commodityLower] || '🌱',
            minPrice: item.min_price || 0,
            maxPrice: item.max_price || 0,
            modalPrice: item.modal_price || 0,
            unit: item.unit || 'per quintal',
            state: item.state || '',
            district: item.district || '',
            market: item.market || '',
            variety: item.variety || '',
            arrivalDate: item.arrival_date || '',
            // Legacy mock fields (if present)
            trend: item.trend || null,
            change: item.change ? parseFloat(item.change) : null,
          };
        });
        setMarketData(items);
        setDataSource(data.source || 'unknown');
      } else {
        setError(data.error || 'Failed to fetch prices');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = marketData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLive = dataSource === 'data.gov.in';

  // Summary stats
  const avgPrice = marketData.length > 0 
    ? Math.round(marketData.reduce((sum, i) => sum + i.modalPrice, 0) / marketData.length)
    : 0;
  const highestPrice = marketData.length > 0
    ? marketData.reduce((max, i) => i.modalPrice > max.modalPrice ? i : max, marketData[0])
    : null;
  const lowestPrice = marketData.length > 0
    ? marketData.reduce((min, i) => i.modalPrice < min.modalPrice ? i : min, marketData[0])
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="animate-spin h-8 w-8 text-primary-600" />
        <span className="text-surface-500 font-medium">Loading market data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('marketPrices')}</h1>
          <p className="text-surface-500 mt-1">
            {isLive ? 'Live mandi prices from data.gov.in' : 'Commodity prices (cached data)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isLive ? 'Live' : 'Cached'}
          </span>
          <button
            onClick={fetchMarketData}
            id="market-refresh-btn"
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-surface-600">Market Summary</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Total Records</span>
              <span className="font-bold text-surface-900">{marketData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Avg Modal Price</span>
              <span className="font-bold text-surface-900">₹{avgPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Data Source</span>
              <span className={`badge ${isLive ? 'badge-success' : 'badge-warning'}`}>
                {isLive ? 'data.gov.in' : 'Mock'}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-surface-600">Highest Price</p>
          </div>
          {highestPrice && (
            <div className="text-center">
              <span className="text-2xl mb-1 block">{highestPrice.emoji}</span>
              <h3 className="text-lg font-bold text-surface-900">{highestPrice.name}</h3>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{highestPrice.modalPrice.toLocaleString()}</p>
              <p className="text-sm text-surface-500">
                {highestPrice.market ? `${highestPrice.market}, ${highestPrice.state}` : highestPrice.unit}
              </p>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-surface-600">Lowest Price</p>
          </div>
          {lowestPrice && (
            <div className="text-center">
              <span className="text-2xl mb-1 block">{lowestPrice.emoji}</span>
              <h3 className="text-lg font-bold text-surface-900">{lowestPrice.name}</h3>
              <p className="text-2xl font-extrabold text-red-600 mt-1">₹{lowestPrice.modalPrice.toLocaleString()}</p>
              <p className="text-sm text-surface-500">
                {lowestPrice.market ? `${lowestPrice.market}, ${lowestPrice.state}` : lowestPrice.unit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-surface-700 mb-2">Search Commodity</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                id="market-search"
                placeholder="Search crops, states, markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-semibold text-surface-700 mb-2">Filter by State</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                id="market-state-filter"
                placeholder="e.g. Maharashtra"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMarketData()}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Price Table */}
      <Card title="Commodity Prices" icon={IndianRupee} iconBg="bg-violet-100" iconColor="text-violet-600">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3.5 px-6 text-xs font-bold text-surface-500 uppercase tracking-wider">Commodity</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold text-surface-500 uppercase tracking-wider">Modal Price (₹)</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold text-surface-500 uppercase tracking-wider">Range (₹)</th>
                {isLive && (
                  <th className="text-left py-3.5 px-6 text-xs font-bold text-surface-500 uppercase tracking-wider">Market</th>
                )}
                <th className="text-left py-3.5 px-6 text-xs font-bold text-surface-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <div className="font-semibold text-surface-900">{item.name}</div>
                        {item.variety && <div className="text-xs text-surface-500">{item.variety}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-surface-900">₹{item.modalPrice.toLocaleString()}</div>
                    <div className="text-xs text-surface-500">{item.unit}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-surface-700">
                      ₹{item.minPrice.toLocaleString()} — ₹{item.maxPrice.toLocaleString()}
                    </div>
                  </td>
                  {isLive && (
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-surface-800">{item.market}</div>
                      <div className="text-xs text-surface-500">{item.district}, {item.state}</div>
                    </td>
                  )}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-surface-400" />
                      <span className="text-xs text-surface-500">
                        {item.arrivalDate || 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">No commodities found</p>
            <p className="text-surface-400 text-sm mt-1">Try adjusting your search or state filter</p>
          </div>
        )}
      </Card>

      {/* Market Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Price Alerts" icon={Bell} iconBg="bg-amber-100" iconColor="text-amber-600">
          <div className="space-y-4">
            <div className="p-5 bg-surface-50 border border-surface-200 rounded-2xl">
              <h4 className="font-bold text-surface-900 mb-2">Set Price Alerts</h4>
              <p className="text-sm text-surface-600 mb-4">
                Get notified when commodity prices reach your target levels.
              </p>
              <button id="create-alert-btn" className="btn-primary w-full">
                Create Alert
              </button>
            </div>
            
            <div className="space-y-2.5">
              <h4 className="font-bold text-surface-900 text-sm">Data Source</h4>
              <div className="alert alert-info py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    {isLive 
                      ? `Live from data.gov.in (${marketData.length} records)` 
                      : `Mock data (${marketData.length} commodities)`}
                  </span>
                  <span className={`badge ${isLive ? 'badge-success' : 'badge-warning'}`}>
                    {isLive ? 'Live' : 'Cached'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="About Market Data" icon={BarChart3} iconBg="bg-indigo-100" iconColor="text-indigo-600">
          <div className="space-y-4">
            <div className="p-4 bg-surface-50 rounded-xl">
              <h4 className="font-bold text-surface-800 text-sm mb-2">Data Source</h4>
              <p className="text-sm text-surface-600">
                {isLive
                  ? 'Prices are fetched live from the Government of India\'s Open Data Platform (data.gov.in), specifically the daily commodity prices from various mandis across India.'
                  : 'Currently showing cached/estimated prices. Live data from data.gov.in will load when the API is available.'}
              </p>
            </div>
            <div className="p-4 bg-surface-50 rounded-xl">
              <h4 className="font-bold text-surface-800 text-sm mb-2">Price Units</h4>
              <p className="text-sm text-surface-600">
                All prices are displayed in <strong>Indian Rupees (₹)</strong> per quintal (100 kg).
                Modal price represents the most common trading price in the market.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketPrices;