import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockCurrentUser } from '../mock/sampleWeddingData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile helper
  const loadProfile = async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch note:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: use mock user
      setUser({
        id: mockCurrentUser.id,
        email: mockCurrentUser.email,
        user_metadata: { full_name: mockCurrentUser.name },
      });
      setProfile({
        full_name: mockCurrentUser.name,
        avatar_url: mockCurrentUser.avatar,
      });
      setLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await loadProfile(session.user.id);
        setProfile(prof);
      }
      setLoading(false);
    });

    // 2. Auth state changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const prof = await loadProfile(session.user.id);
          setProfile(prof);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with Supabase Auth
  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      };
      setUser(demoUser);
      setProfile({ full_name: fullName, avatar_url: '' });
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  // Sign in with Supabase Auth
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: mockCurrentUser.id,
        email,
        user_metadata: { full_name: mockCurrentUser.name },
      };
      setUser(demoUser);
      setProfile({ full_name: mockCurrentUser.name, avatar_url: mockCurrentUser.avatar });
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Password recovery
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
