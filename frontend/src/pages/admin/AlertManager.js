import React, { useState, useEffect } from 'react';
import { BellRing, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import Card from '../../components/Common/Card';
import DataTable from '../../components/Admin/DataTable';
import { getAlerts, createAlert, toggleAlert, deleteAlert } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const REGIONS = ['All', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'West Bengal', 'Bihar'];

const AlertManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', region: '' });
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getAlerts()); } catch (err) { addToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { addToast('Title and message required', 'warning'); return; }
    setCreating(true);
    try {
      await createAlert(form);
      addToast('Alert created!', 'success');
      setForm({ title: '', message: '', region: '' });
      await fetchData();
    } catch (err) { addToast(err.message, 'error'); } finally { setCreating(false); }
  };

  const handleToggle = async (id, current) => {
    try {
      await toggleAlert(id, !current);
      setData(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
      addToast(!current ? 'Alert activated' : 'Alert deactivated', 'info');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await deleteAlert(id);
      setData(prev => prev.filter(a => a.id !== id));
      addToast('Alert deleted', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'message', label: 'Message', render: (v) => <span className="text-sm text-surface-500 line-clamp-2">{v}</span> },
    { key: 'region', label: 'Region', render: (v) => v || 'All' },
    { key: 'is_active', label: 'Status', render: (v, row) => (
      <button onClick={() => handleToggle(row.id, v)} className="flex items-center gap-1.5">
        {v ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-surface-400" />}
        <span className={`text-xs font-bold ${v ? 'text-emerald-600' : 'text-surface-400'}`}>{v ? 'Active' : 'Inactive'}</span>
      </button>
    )},
    { key: 'created_at', label: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: '', sortable: false, render: (_, row) => (
      <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    )},
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Alert Management</h1>

      <Card title="Create Alert" icon={Plus} iconBg="bg-amber-100" iconColor="text-amber-600">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" placeholder="Alert title" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Message</label>
            <input type="text" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className="input-field" placeholder="Alert message" />
          </div>
          <div className="flex gap-2">
            <select value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} className="input-field flex-1">
              <option value="">All Regions</option>
              {REGIONS.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">
              {creating ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Alert History" icon={BellRing} iconBg="bg-amber-100" iconColor="text-amber-600">
        <DataTable data={data} columns={columns} searchKeys={['title','message','region']} searchPlaceholder="Search alerts..." emptyMessage="No alerts" />
      </Card>
    </div>
  );
};

export default AlertManager;
