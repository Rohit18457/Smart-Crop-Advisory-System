import React, { useState, useEffect } from 'react';
import { Languages, Save, Plus, RefreshCw } from 'lucide-react';
import Card from '../../components/Common/Card';
import { getTranslations, upsertTranslation } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const LANGS = ['en', 'hi', 'mr'];
const LANG_LABELS = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

const ContentManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState({});
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      const raw = await getTranslations();
      // Group by key
      const grouped = {};
      raw.forEach(t => {
        if (!grouped[t.key]) grouped[t.key] = {};
        grouped[t.key][t.lang] = t.value;
      });
      setData(Object.entries(grouped).map(([key, vals]) => ({ key, ...vals })));
    } catch (err) { addToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleSave = async (key, lang, value) => {
    const sKey = `${key}-${lang}`;
    setSaving(s => ({...s, [sKey]: true}));
    try {
      await upsertTranslation(key, lang, value);
      addToast(`Saved "${key}" (${LANG_LABELS[lang]})`, 'success');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(s => ({...s, [sKey]: false})); }
  };

  const handleChange = (key, lang, value) => {
    setData(prev => prev.map(row => row.key === key ? { ...row, [lang]: value } : row));
  };

  const addKey = () => {
    if (!newKey.trim()) return;
    if (data.find(d => d.key === newKey.trim())) { addToast('Key already exists', 'warning'); return; }
    setData(prev => [{ key: newKey.trim(), en: '', hi: '', mr: '' }, ...prev]);
    setNewKey('');
  };

  const filtered = data.filter(d => d.key.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Content Management</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage multilingual content</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {/* Add key + search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKey()} placeholder="New translation key..." className="input-field flex-1" />
            <button onClick={addKey} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys..." className="input-field sm:w-64" />
        </div>
      </Card>

      {/* Translation table */}
      <Card title="Translations" icon={Languages} iconBg="bg-indigo-100" iconColor="text-indigo-600">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 text-xs font-bold text-surface-500 uppercase w-48">Key</th>
                {LANGS.map(l => <th key={l} className="text-left py-3 px-4 text-xs font-bold text-surface-500 uppercase">{LANG_LABELS[l]}</th>)}
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.key} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="py-3 px-4 text-sm font-mono text-surface-600 dark:text-surface-400">{row.key}</td>
                  {LANGS.map(l => (
                    <td key={l} className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <input type="text" value={row[l] || ''} onChange={e => handleChange(row.key, l, e.target.value)} className="input-field !py-1.5 text-sm flex-1" />
                        <button onClick={() => handleSave(row.key, l, row[l] || '')} disabled={saving[`${row.key}-${l}`]} className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0">
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  ))}
                  <td></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-surface-400">No translations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ContentManager;
