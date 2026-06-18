/**
 * History Service
 * ================
 * Saves user activity (disease detection, crop recommendations) to Supabase.
 */

import { supabase } from '../supabase';

/**
 * Save a history entry for the current user.
 * @param {string} type - 'disease_detection' | 'crop_recommendation'
 * @param {string} title - Short title (e.g. "Tomato Leaf Blight Detected")
 * @param {string} result - Description of the result
 * @param {number|null} confidence - Confidence percentage (optional)
 * @param {object|null} metadata - Any extra JSON data (optional)
 */
export const saveHistory = async (type, title, result, confidence = null, metadata = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_history')
      .insert({
        user_id: user.id,
        type,
        title,
        result,
        confidence,
        metadata,
      });

    if (error) {
      console.warn('Could not save history:', error.message);
    }
  } catch (err) {
    console.warn('History save error:', err);
  }
};
