import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://escefqdmzcqcfbgqwjil.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2VmcWRtemNxY2ZiZ3F3amlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDEyNDEsImV4cCI6MjEwODUxNzI0MX0.QuZxSzCk1LItK8XOUIWczXQhUz6FhnAgZnddZhKtiqc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealth {
  connected: boolean;
  projectRef: string;
  url: string;
  tablesDetected: string[];
  message: string;
}

/**
 * Checks connection status to Supabase cloud.
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealth> {
  const projectRef = 'escefqdmzcqcfbgqwjil';
  try {
    // Attempt to query the public schema tables or an empty query
    const { data, error } = await supabase.from('water_readings').select('id').limit(1);

    if (error) {
      // 404 or relation does not exist means connection succeeded, but tables need to be created
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('not found')) {
        return {
          connected: true,
          projectRef,
          url: supabaseUrl,
          tablesDetected: [],
          message: 'Connected to Supabase. Schema tables ready to be provisioned.',
        };
      }
      return {
        connected: false,
        projectRef,
        url: supabaseUrl,
        tablesDetected: [],
        message: error.message,
      };
    }

    return {
      connected: true,
      projectRef,
      url: supabaseUrl,
      tablesDetected: ['water_readings'],
      message: 'Connected to Supabase cloud database.',
    };
  } catch (err: any) {
    return {
      connected: false,
      projectRef,
      url: supabaseUrl,
      tablesDetected: [],
      message: err.message || 'Failed to connect to Supabase endpoint.',
    };
  }
}
