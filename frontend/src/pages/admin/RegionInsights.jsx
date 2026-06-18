import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../../components/Common/Card';
import DataTable from '../../components/Admin/DataTable';
import { getRegionInsights } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const RegionInsights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getRegionInsights()); } catch (err) { addToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const chartData = data.slice(0, 10).map(r => ({ name: r.region.substring(0,12), predictions: r.totalPredictions, users: r.totalUsers }));

  const columns = [
    { key: 'region', label: 'Region', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'totalUsers', label: 'Users' },
    { key: 'totalPredictions', label: 'Predictions' },
    { key: 'topDisease', label: 'Top Disease', render: (v) => <span className="capitalize">{(v||'').replace(/_/g,' ')}</span> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Region Insights</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Disease patterns by location</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      <Card title="Predictions & Users by Region" icon={MapPin} iconBg="bg-teal-100" iconColor="text-teal-600">
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="predictions" fill="#059669" radius={[4,4,0,0]} />
                <Bar dataKey="users" fill="#0ea5e9" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-full text-surface-400">No region data yet</div>}
        </div>
      </Card>

      <Card title="Region Details" icon={MapPin} iconBg="bg-violet-100" iconColor="text-violet-600">
        <DataTable data={data} columns={columns} searchKeys={['region','topDisease']} searchPlaceholder="Search regions..." emptyMessage="No region data" />
      </Card>
    </div>
  );
};

export default RegionInsights;
