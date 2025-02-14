import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { router } from 'expo-router';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Отримуємо поточну сесію при ініціалізації
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session check error:', error);
        setError(error);
      } else {
        console.log('Session check result:', session);
        if (session?.user) {
          setUser(session.user);
          router.replace('/(tabs)/ai-chat');
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Підписуємося на зміни авторизації
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      if (session?.user) {
        setUser(session.user);
        router.replace('/(tabs)/ai-chat');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful:', data);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      console.log('Sign up successful:', data);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}