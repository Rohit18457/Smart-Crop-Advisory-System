/**
 * Fixed Auth Context - Compatible with Enhanced Database
 * =====================================================
 * Updated to work with the enhanced profiles table structure
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Get Auth Token ──────────────────────────────────────────────────────
  const getAuthToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, []);

  // ── Fetch profile from `profiles` table ─────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }, []);

  // ── Listen for auth state changes ───────────────────────────────────────
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Register (FIXED for enhanced database) ─────────────────────────────
  const register = async ({ email, password, fullName, soilType, location, preferredLanguage, phone }) => {
    try {
      // Step 1: Create auth user with raw_user_meta_data options
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email: email,
            role: 'farmer',
            soil_type: soilType || null,
            location: location || null,
            language_preference: preferredLanguage || 'en',
            preferred_language: preferredLanguage || 'en',
            phone: phone || null
          }
        }
      });

      if (error) {
        // Supabase returns "User already registered" for duplicate emails
        if (error.message && error.message.toLowerCase().includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw error;
      }

      // Supabase (with email confirmation enabled) may return a user with empty identities
      // if the email is already registered — detect this case
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      // Step 2: Create profile with enhanced fields (uses upsert to avoid trigger conflicts)
      // Note: We only perform client-side upsert/preferences when session is active (email confirmation is off/auto-login on).
      // If email confirmation is enabled, session will be null and client-side RLS will block unauthenticated upserts.
      // In that case, the database trigger handle_new_user executes SECURITY DEFINER to create the profile successfully.
      if (data.user && data.session) {
        const profileData = {
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: 'farmer',
          soil_type: soilType || null,
          location: location || null,
          language_preference: preferredLanguage || 'en',
          preferred_language: preferredLanguage || 'en',
          phone: phone || null,
          // Enhanced fields with defaults
          farm_size_acres: null,
          primary_crops: [],
          farming_experience_years: null,
          preferred_units: 'metric',
          notification_preferences: {
            weather: true,
            market: true,
            alerts: true,
            recommendations: true
          },
          last_active_at: new Date().toISOString(),
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          
          // If it's a column doesn't exist error, try with basic fields only
          if (profileError.code === '42703') {
            console.log('Trying with basic profile fields...');
            const basicProfileData = {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'farmer',
              soil_type: soilType || null,
              location: location || null,
              language_preference: preferredLanguage || 'en',
              preferred_language: preferredLanguage || 'en',
              phone: phone || null,
            };

            const { error: basicProfileError } = await supabase
              .from('profiles')
              .upsert(basicProfileData);

            if (basicProfileError) {
              throw new Error('Account created but profile setup failed. Please contact support.');
            }
          } else {
            throw new Error('Account created but profile setup failed. Please contact support.');
          }
        }

        // Create initial user preferences
        try {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: data.user.id,
              dashboard_layout: {
                widgets: ["weather", "recommendations", "market", "alerts"]
              },
              favorite_crops: [],
              alert_thresholds: {
                weather: {
                  temperature: { min: 10, max: 40 },
                  rainfall: { min: 0, max: 100 }
                },
                market: {
                  price_change_percent: 10
                }
              },
              privacy_settings: {
                share_analytics: true,
                share_location: true,
                marketing_emails: false
              }
            });
        } catch (prefError) {
          console.log('User preferences creation failed (non-critical):', prefError);
        }

        // Create welcome notification
        try {
          await supabase.rpc('create_notification', {
            target_user_id: data.user.id,
            notification_title: 'Welcome to AgriSmart! 🌱',
            notification_message: 'Your account has been created successfully. Start by exploring crop recommendations and disease detection features.',
            notification_type: 'system',
            notification_priority: 'normal',
            notification_data: {
              welcome: true,
              action_url: '/app/dashboard'
            },
            expires_in_hours: 168 // 7 days
          });
        } catch (notifError) {
          console.log('Welcome notification creation failed (non-critical):', notifError);
        }

        await fetchProfile(data.user.id);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // ── Login (Enhanced with analytics) ────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchProfile(data.user.id);
        
        // Update last active timestamp
        try {
          await supabase
            .from('profiles')
            .update({ 
              last_active_at: new Date().toISOString() 
            })
            .eq('id', data.user.id);
        } catch (updateError) {
          console.log('Last active update failed (non-critical):', updateError);
        }

        // Track login analytics
        try {
          await supabase
            .from('user_analytics')
            .insert({
              user_id: data.user.id,
              session_id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              page_views: { login: 1 },
              time_spent_minutes: 0,
              actions_taken: [{ action: 'login', timestamp: Date.now() }],
              device_info: {
                userAgent: navigator.userAgent,
                screen: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : 'unknown',
                platform: navigator.platform,
                language: navigator.language
              }
            });
        } catch (analyticsError) {
          console.log('Analytics tracking failed (non-critical):', analyticsError);
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // ── Logout (Enhanced with cleanup) ─────────────────────────────────────
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      
      // Clear any cached data
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // ── Update Profile (Enhanced) ──────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const updateData = {
        ...updates,
        // Sync both preferred_language and language_preference fields for database schema resilience
        preferred_language: updates.language_preference || updates.preferred_language || profile?.preferred_language || 'en',
        language_preference: updates.language_preference || updates.preferred_language || profile?.language_preference || 'en',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // ── Get Dashboard Stats ────────────────────────────────────────────────
  const getDashboardStats = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        user_uuid: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return null;
    }
  };

  // ── Context value ───────────────────────────────────────────────────────
  const value = {
    user,
    profile,
    loading,
    register,
    login,
    logout,
    updateProfile,
    fetchProfile,
    getAuthToken,
    getDashboardStats,
    isAdmin: profile?.role === 'admin',
    isFarmer: profile?.role === 'farmer',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
