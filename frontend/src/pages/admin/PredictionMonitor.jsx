import React, { useState, useEffect } from 'react';
import { Activity, Flag, RefreshCw, Filter, Download } from 'lucide-react';
import Card from '../../components/Common/Card';
import DataTable from '../../components/Admin/DataTable';
import { getPredictions, flagPrediction, exportToCSV } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const PredictionMonitor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ disease: '', minConf: '', flagged: false });
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      const f = {};
      if (filters.disease) f.disease = filters.disease;
      if (filters.minConf) f.minConf = parseFloat(filters.minConf);
      if (filters.flagged) f.flagged = true;
      const res = await getPredictions(f);
      setData(res);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (id, current) => {
    try {
      await flagPrediction(id, !current);
      setData(prev => prev.map(p => p.id === id ? { ...p, flagged: !current } : p));
      addToast(!current ? 'Prediction flagged' : 'Flag removed', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const confBadge = (conf) => {
    const v = parseFloat(conf || 0);
    const cls = v >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : v >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return <span className={`badge ${cls}`}>{v.toFixed(1)}%</span>;
  };

  const columns = [
    { key: 'profiles', label: 'User', render: (_, row) => row.profiles?.full_name || row.user_id?.slice(0,8) },
    { key: 'image_url', label: 'Image', sortable: false, render: (v) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : '—' },
    { key: 'prediction', label: 'Disease', render: (v) => <span className="font-medium capitalize">{(v||'').replace(/_/g,' ')}</span> },
    { key: 'confidence', label: 'Confidence', render: (v) => confBadge(v) },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'flagged', label: 'Actions', sortable: false, render: (v, row) => (
      <button onClick={() => handleFlag(row.id, v)} className={`p-1.5 rounded-lg transition-colors ${v ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'hover:bg-surface-100 text-surface-400 dark:hover:bg-surface-800'}`}>
        <Flag className="h-4 w-4" fill={v ? 'currentColor' : 'none'} />
      </button>
    )},
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Prediction Monitoring</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{data.length} predictions tracked</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1">Disease</label>
            <input type="text" value={filters.disease} onChange={e => setFilters(f => ({...f, disease: e.target.value}))} placeholder="e.g. Blight" className="input-field !py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1">Min Confidence</label>
            <input type="number" value={filters.minConf} onChange={e => setFilters(f => ({...f, minConf: e.target.value}))} placeholder="0-100" className="input-field !py-2 text-sm w-28" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.flagged} onChange={e => setFilters(f => ({...f, flagged: e.target.checked}))} className="rounded" />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Flagged only</span>
          </label>
          <button onClick={fetchData} className="btn-primary flex items-center gap-2 !py-2"><Filter className="h-4 w-4" /> Apply</button>
        </div>
      </Card>

      <Card title="Predictions" icon={Activity} iconBg="bg-violet-100" iconColor="text-violet-600">
        <DataTable
          data={data}
          columns={columns}
          searchKeys={['prediction', 'user_id']}
          searchPlaceholder="Search predictions..."
          emptyMessage="No predictions found"
          actions={
            <button onClick={() => exportToCSV(data.map(d => ({ user: d.profiles?.full_name, disease: d.prediction, confidence: d.confidence, date: d.created_at, flagged: d.flagged })), 'predictions.csv')} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          }
        />
      </Card>
    </div>
  );
};

export default PredictionMonitor;
