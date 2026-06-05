import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import {
  User, Mail, MapPin, Globe, Phone, Layers, Shield, Calendar,
  Bug, Sprout, Edit3, Save, X, Clock, ChevronRight, Leaf
} from 'lucide-react';

const SOIL_TYPES = [
  { value: '', label: 'Not set' },
  { value: 'alluvial', label: 'Alluvial Soil' },
  { value: 'black', label: 'Black (Cotton) Soil' },
  { value: 'red', label: 'Red Soil' },
  { value: 'laterite', label: 'Laterite Soil' },
  { value: 'sandy', label: 'Sandy Soil' },
  { value: 'clay', label: 'Clay Soil' },
  { value: 'loamy', label: 'Loamy Soil' },
  { value: 'saline', label: 'Saline Soil' },
];

const Profile = () => {
  const { profile, updateProfile, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [form, setForm] = useState({
    full_name: '', location: '', soil_type: '', language_preference: '', phone: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        location: profile.location || '',
        soil_type: profile.soil_type || '',
        language_preference: profile.language_preference || profile.preferred_language || 'en',
        phone: profile.phone || '',
      });
    }
    fetchHistory();
  }, [profile]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setHistory(data);
    } catch (err) {
      console.log('History table may not exist yet:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case 'disease_detection': return { icon: Bug, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'crop_recommendation': return { icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { icon: Leaf, color: 'text-primary-600', bg: 'bg-primary-50' };
    }
  };

  const soilLabel = SOIL_TYPES.find(s => s.value === (profile?.soil_type || ''))?.label || 'Not set';
  const langLabel = { en: 'English', hi: 'हिंदी (Hindi)', mr: 'मराठी (Marathi)' }[profile?.language_preference || profile?.preferred_language] || 'English';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 rounded-2xl p-8 text-white shadow-glow-lg animate-fade-in">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold truncate">{profile?.full_name || 'User'}</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Shield className="h-3 w-3" /> ADMIN
                </span>
              )}
            </div>
            <p className="text-primary-100">{profile?.email}</p>
            <p className="text-primary-200 text-sm mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
            </p>
          </div>
          <button onClick={() => setEditing(!editing)} className="hidden md:flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            {editing ? <><X className="h-4 w-4" /> Cancel</> : <><Edit3 className="h-4 w-4" /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-bold text-surface-900 mb-5">Farmer Details</h3>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Full Name</label>
                  <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Soil Type</label>
                  <select value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})} className="input-field text-sm">
                    {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Preferred Language</label>
                  <select value={form.language_preference} onChange={e => setForm({...form, language_preference: e.target.value})} className="input-field text-sm">
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field text-sm" />
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: User, label: 'Name', value: profile?.full_name || 'Not set' },
                  { icon: Mail, label: 'Email', value: profile?.email || 'Not set' },
                  { icon: MapPin, label: 'Location', value: profile?.location || 'Not set' },
                  { icon: Layers, label: 'Soil Type', value: soilLabel },
                  { icon: Globe, label: 'Language', value: langLabel },
                  { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                      <div className="p-2 bg-surface-50 rounded-lg">
                        <Icon className="h-4 w-4 text-surface-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-medium text-surface-900 truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setEditing(true)} className="md:hidden btn-secondary w-full text-sm flex items-center justify-center gap-2 mt-2">
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-surface-900">Activity History</h3>
              <span className="badge badge-info">{history.length} records</span>
            </div>

            {loadingHistory ? (
              <div className="text-center py-12">
                <div className="dot-pulse justify-center"><span></span><span></span><span></span></div>
                <p className="text-sm text-surface-500 mt-3">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, i) => {
                  const { icon: Icon, color, bg } = getHistoryIcon(item.type);
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                      <div className={`p-2.5 ${bg} rounded-xl flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-surface-900 text-sm">{item.title}</p>
                          <ChevronRight className="h-4 w-4 text-surface-400" />
                        </div>
                        <p className="text-xs text-surface-500 line-clamp-2">{item.result}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-surface-400" />
                          <span className="text-[11px] text-surface-400">
                            {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          {item.confidence && (
                            <span className="badge badge-success text-[10px] ml-auto">{item.confidence}% confidence</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-surface-300" />
                </div>
                <p className="font-semibold text-surface-700 mb-1">No activity yet</p>
                <p className="text-sm text-surface-500">Your disease detections and crop recommendations will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
