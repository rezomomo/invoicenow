import React, { useEffect, useState } from 'react';
import { Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserSettings } from '../types';

interface SettingsProps {
  onSettingsUpdate?: (userId: string) => void;
}

export function Settings({ onSettingsUpdate }: SettingsProps) {
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.takealot_api_key?.startsWith('Key ')) {
        data.takealot_api_key = data.takealot_api_key.substring(4);
      }
      
      setSettings(data || {});
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = () => {
    const errors: Record<string, string> = {};
    
    if (!settings.takealot_api_key?.trim()) {
      errors.takealot_api_key = 'API Key is required';
    }
    
    if (!settings.company_name?.trim()) {
      errors.company_name = 'Company Name is required';
    }
    
    if (!settings.trading_name?.trim()) {
      errors.trading_name = 'Trading Name is required';
    }
    
    if (!settings.registration_number?.trim()) {
      errors.registration_number = 'Registration Number is required';
    }
    
    if (!settings.address?.trim()) {
      errors.address = 'Address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSettings()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const apiKey = settings.takealot_api_key?.replace(/^Key\s+/, '');
      const formattedSettings = {
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...settings,
        takealot_api_key: apiKey ? `Key ${apiKey}` : '',
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(formattedSettings, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;
      setSuccess(true);
      if (onSettingsUpdate) {
        onSettingsUpdate(user.id);
      }
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin mr-2" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Takealot API Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={settings.takealot_api_key || ''}
            onChange={(e) => {
              setSettings({ ...settings, takealot_api_key: e.target.value });
              setValidationErrors({ ...validationErrors, takealot_api_key: '' });
            }}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.takealot_api_key ? 'border-red-500' : ''
            }`}
            placeholder="Enter your Takealot API key"
          />
          {validationErrors.takealot_api_key && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.takealot_api_key}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.company_name || ''}
            onChange={(e) => {
              setSettings({ ...settings, company_name: e.target.value });
              setValidationErrors({ ...validationErrors, company_name: '' });
            }}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.company_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your company name"
          />
          {validationErrors.company_name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.company_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trading Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.trading_name || ''}
            onChange={(e) => {
              setSettings({ ...settings, trading_name: e.target.value });
              setValidationErrors({ ...validationErrors, trading_name: '' });
            }}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.trading_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your trading name"
          />
          {validationErrors.trading_name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.trading_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.registration_number || ''}
            onChange={(e) => {
              setSettings({ ...settings, registration_number: e.target.value });
              setValidationErrors({ ...validationErrors, registration_number: '' });
            }}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.registration_number ? 'border-red-500' : ''
            }`}
            placeholder="Enter your registration number"
          />
          {validationErrors.registration_number && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.registration_number}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={settings.address || ''}
            onChange={(e) => {
              setSettings({ ...settings, address: e.target.value });
              setValidationErrors({ ...validationErrors, address: '' });
            }}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.address ? 'border-red-500' : ''
            }`}
            rows={3}
            placeholder="Enter your company address"
          />
          {validationErrors.address && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">Settings saved successfully!</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}