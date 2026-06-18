/**
 * Admin Service — Supabase queries for admin dashboard
 *
 * Fix #16: Optimized getAdminStats to use Supabase count queries
 * instead of downloading all records to the client.
 */
import { supabase } from '../supabase';

// ── Stats (optimized — uses count queries instead of fetching all rows) ─────
export const getAdminStats = async () => {
  const [users, predictions, recentPredictions] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('predictions').select('id', { count: 'exact', head: true }),
    supabase
      .from('predictions')
      .select('user_id, prediction')
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  // Count active users from recent predictions only (already fetched)
  const activeUsers = new Set(
    (recentPredictions.data || []).map((r) => r.user_id)
  ).size;

  // Count disease distribution from recent data (not ALL predictions)
  const counts = {};
  (recentPredictions.data || []).forEach((d) => {
    counts[d.prediction] = (counts[d.prediction] || 0) + 1;
  });
  const topDisease = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalUsers: users.count || 0,
    totalPredictions: predictions.count || 0,
    activeUsers,
    topDisease: topDisease
      ? { name: topDisease[0], count: topDisease[1] }
      : null,
    diseaseDistribution: counts,
  };
};

// ── Predictions ────────────────────────────────────────
export const getPredictions = async (filters = {}) => {
  let query = supabase
    .from('predictions')
    .select(
      '*, profiles!predictions_user_id_fkey(full_name, location)'
    )
    .order('created_at', { ascending: false })
    .limit(200); // Prevent unbounded fetches

  if (filters.disease) query = query.ilike('prediction', `%${filters.disease}%`);
  if (filters.minConf) query = query.gte('confidence', filters.minConf);
  if (filters.maxConf) query = query.lte('confidence', filters.maxConf);
  if (filters.flagged) query = query.eq('flagged', true);
  if (filters.from) query = query.gte('created_at', filters.from);
  if (filters.to) query = query.lte('created_at', filters.to);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const flagPrediction = async (id, flagged = true) => {
  const { error } = await supabase
    .from('predictions')
    .update({ flagged })
    .eq('id', id);
  if (error) throw error;
};

export const savePrediction = async (prediction) => {
  const { data, error } = await supabase
    .from('predictions')
    .insert(prediction)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── Feedback ───────────────────────────────────────────
export const getFeedback = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select(
      '*, profiles!feedback_user_id_fkey(full_name), predictions!feedback_prediction_id_fkey(prediction, confidence, image_url)'
    )
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
};

export const submitFeedback = async (fb) => {
  const { error } = await supabase.from('feedback').insert(fb);
  if (error) throw error;
};

// ── Alerts ─────────────────────────────────────────────
export const getAlerts = async () => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createAlert = async (alert) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const toggleAlert = async (id, isActive) => {
  const { error } = await supabase
    .from('alerts')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw error;
};

export const deleteAlert = async (id) => {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) throw error;
};

// ── Dataset ────────────────────────────────────────────
export const getDataset = async () => {
  const { data, error } = await supabase
    .from('dataset')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
};

export const uploadDatasetImage = async (file, label, userId) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from('dataset-images')
    .upload(fileName, file);
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage
    .from('dataset-images')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('dataset')
    .insert({
      image_url: urlData.publicUrl,
      label,
      uploaded_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── Translations ───────────────────────────────────────
export const getTranslations = async () => {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .order('key');
  if (error) throw error;
  return data || [];
};

export const upsertTranslation = async (key, lang, value) => {
  const { error } = await supabase.from('translations').upsert(
    { key, lang, value, updated_at: new Date().toISOString() },
    { onConflict: 'key,lang' }
  );
  if (error) throw error;
};

// ── Region insights (optimized — limits data fetched) ──
export const getRegionInsights = async () => {
  const { data: predictions } = await supabase
    .from('predictions')
    .select('prediction, user_id, profiles!predictions_user_id_fkey(location)')
    .limit(2000); // Cap to prevent huge client-side processing

  const regions = {};
  (predictions || []).forEach((p) => {
    const loc =
      p.profiles?.location?.split(',')[0]?.trim() || 'Unknown';
    if (!regions[loc])
      regions[loc] = { users: new Set(), diseases: {}, total: 0 };
    regions[loc].users.add(p.user_id);
    regions[loc].diseases[p.prediction] =
      (regions[loc].diseases[p.prediction] || 0) + 1;
    regions[loc].total++;
  });

  return Object.entries(regions).map(([region, d]) => ({
    region,
    totalUsers: d.users.size,
    totalPredictions: d.total,
    topDisease:
      Object.entries(d.diseases).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
    diseases: d.diseases,
  }));
};

// ── CSV Export ──────────────────────────────────────────
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map((row) =>
      keys
        .map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Daily chart data ───────────────────────────────────
export const getDailyPredictions = async (days = 30) => {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('predictions')
    .select('created_at')
    .gte('created_at', since);

  const counts = {};
  (data || []).forEach((d) => {
    const day = d.created_at.slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: counts[key] || 0 });
  }
  return result;
};
