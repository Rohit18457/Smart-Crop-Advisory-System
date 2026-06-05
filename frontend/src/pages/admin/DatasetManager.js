import React, { useState, useEffect } from 'react';
import { Database, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Common/Card';
import DataTable from '../../components/Admin/DataTable';
import { getDataset, uploadDatasetImage } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const DatasetManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getDataset()); } catch (err) { addToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !label.trim()) { addToast('Please select a file and enter a label', 'warning'); return; }
    setUploading(true);
    try {
      await uploadDatasetImage(file, label.trim(), user?.id);
      addToast('Image uploaded successfully!', 'success');
      setFile(null); setLabel('');
      await fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally { setUploading(false); }
  };

  // Class distribution
  const classCounts = {};
  data.forEach(d => { classCounts[d.label] = (classCounts[d.label] || 0) + 1; });
  const chartData = Object.entries(classCounts).sort((a,b) => b[1]-a[1]).map(([name, count]) => ({ name: name.substring(0,15), count }));

  const columns = [
    { key: 'image_url', label: 'Image', sortable: false, render: (v) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : '—' },
    { key: 'label', label: 'Label', render: (v) => <span className="font-medium capitalize">{v}</span> },
    { key: 'created_at', label: 'Uploaded', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dataset Management</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{data.length} images in dataset</p>
        </div>
        <button onClick={() => addToast('Retraining queued! This may take several minutes.', 'info')} className="btn-primary flex items-center gap-2">🧠 Trigger Retrain</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card title="Upload Image" icon={Upload} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Disease Label</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Tomato_Late_Blight" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Plant Image</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="input-field" />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </Card>

        {/* Class distribution chart */}
        <Card title="Class Distribution" icon={Database} iconBg="bg-violet-100" iconColor="text-violet-600">
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400">
                <p>No data yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Dataset Images" icon={ImageIcon} iconBg="bg-sky-100" iconColor="text-sky-600">
        <DataTable data={data} columns={columns} searchKeys={['label']} searchPlaceholder="Search by label..." emptyMessage="No images in dataset" />
      </Card>
    </div>
  );
};

export default DatasetManager;
