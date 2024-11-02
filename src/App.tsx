import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Settings } from './components/Settings';
import { LandingPage } from './pages/LandingPage';
import { InvoiceApp } from './pages/InvoiceApp';
import type { UserSettings } from './types';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserSettings(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserSettings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserSettings(data);
    } catch (err) {
      console.error('Error loading user settings:', err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/app/*" 
          element={
            session ? (
              <InvoiceApp 
                session={session}
                userSettings={userSettings}
                onSettingsUpdate={loadUserSettings}
              />
            ) : (
              <Auth />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}