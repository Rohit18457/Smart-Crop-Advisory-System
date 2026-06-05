import React, { useState, useEffect } from 'react';
import { Users, Activity, UserCheck, Bug, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../../components/Common/Card';
import { getAdminStats, getDailyPredictions } from '../../services/adminService';

const COLORS = ['#059669','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 ${bg} rounded-xl`}><Icon className={`h-5 w-5 ${color}`} /></div>
      <p className="text-sm font-semibold text-surface-600 dark:text-surface-400">{label}</p>
    </div>
    <h3 className="text-3xl font-extrabold text-surface-900 dark:text-white">{value ?? '—'}</h3>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([getAdminStats(), getDailyPredictions(30)]);
      setStats(s);
      setDailyData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const diseaseChartData = stats ? Object.entries(stats.diseaseDistribution)
    .sort((a,b) => b[1]-a[1]).slice(0, 10)
    .map(([name, count]) => ({ name: name.replace(/_/g,' ').substring(0,20), count })) : [];

  const pieData = stats ? Object.entries(stats.diseaseDistribution)
    .sort((a,b) => b[1]-a[1]).slice(0, 5)
    .map(([name, value]) => ({ name: name.replace(/_/g,' ').substring(0,18), value })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">Admin Overview</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Platform analytics and monitoring</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger"><p className="text-sm">{error}</p></div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="text-sky-600" bg="bg-sky-100 dark:bg-sky-900/30" />
        <StatCard icon={Activity} label="Total Predictions" value={stats?.totalPredictions} color="text-violet-600" bg="bg-violet-100 dark:bg-violet-900/30" />
        <StatCard icon={UserCheck} label="Active Users (7d)" value={stats?.activeUsers} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/30" />
        <StatCard icon={Bug} label="Top Disease" value={stats?.topDisease?.name?.replace(/_/g,' ') || '—'} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Predictions Line Chart */}
        <Card title="Daily Predictions (30d)" icon={TrendingUp} iconBg="bg-sky-100" iconColor="text-sky-600">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Disease Distribution Bar Chart */}
        <Card title="Top Diseases" icon={Bug} iconBg="bg-amber-100" iconColor="text-amber-600">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card title="Disease Distribution" icon={Activity} iconBg="bg-violet-100" iconColor="text-violet-600">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
