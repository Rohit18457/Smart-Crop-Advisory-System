import React, { useState, useEffect } from 'react';
import { MessageSquare, Download, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../../components/Common/Card';
import DataTable from '../../components/Admin/DataTable';
import { getFeedback, exportToCSV } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const FeedbackManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getFeedback()); } catch (err) { addToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? data : data.filter(d => filter === 'correct' ? d.is_correct : !d.is_correct);
  const correctCount = data.filter(d => d.is_correct).length;
  const incorrectCount = data.filter(d => !d.is_correct).length;

  const columns = [
    { key: 'profiles', label: 'User', render: (_, row) => row.profiles?.full_name || '—' },
    { key: 'is_correct', label: 'Verdict', render: (v) => v
      ? <span className="inline-flex items-center gap-1 badge bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Correct</span>
      : <span className="inline-flex items-center gap-1 badge bg-red-100 text-red-700"><XCircle className="h-3 w-3" /> Incorrect</span>
    },
    { key: 'predictions', label: 'Disease', render: (_, row) => <span className="capitalize font-medium">{(row.predictions?.prediction || '').replace(/_/g,' ')}</span> },
    { key: 'predictions_conf', label: 'Conf', render: (_, row) => <span className="text-sm">{(row.predictions?.confidence || 0).toFixed(1)}%</span> },
    { key: 'comment', label: 'Comment', render: (v) => <span className="text-sm text-surface-500 line-clamp-2">{v || '—'}</span> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Feedback Manager</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">AI prediction feedback from farmers</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card cursor-pointer" onClick={() => setFilter('all')}>
          <p className="text-sm font-semibold text-surface-500">Total</p>
          <h3 className="text-2xl font-extrabold text-surface-900 dark:text-white">{data.length}</h3>
        </div>
        <div className="stat-card cursor-pointer border-emerald-200" onClick={() => setFilter('correct')}>
          <p className="text-sm font-semibold text-emerald-600">Correct</p>
          <h3 className="text-2xl font-extrabold text-emerald-600">{correctCount}</h3>
        </div>
        <div className="stat-card cursor-pointer border-red-200" onClick={() => setFilter('incorrect')}>
          <p className="text-sm font-semibold text-red-600">Incorrect</p>
          <h3 className="text-2xl font-extrabold text-red-600">{incorrectCount}</h3>
        </div>
      </div>

      <Card title="Feedback List" icon={MessageSquare} iconBg="bg-indigo-100" iconColor="text-indigo-600">
        <DataTable data={filtered} columns={columns} searchKeys={['comment']} searchPlaceholder="Search feedback..." emptyMessage="No feedback yet"
          actions={
            <button onClick={() => exportToCSV(filtered.map(d => ({ user: d.profiles?.full_name, correct: d.is_correct, disease: d.predictions?.prediction, confidence: d.predictions?.confidence, comment: d.comment, date: d.created_at })), 'feedback.csv')} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          }
        />
      </Card>
    </div>
  );
};

export default FeedbackManager;
