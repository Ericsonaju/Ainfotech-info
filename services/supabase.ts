import { createClient } from '@supabase/supabase-js';

// Em apps Vite, variáveis públicas devem usar o prefixo VITE_
// (e NUNCA devem conter segredos — apenas chaves públicas/anon, etc.)
// @ts-ignore - import.meta.env exists in Vite
const envUrl = import.meta?.env?.VITE_SUPABASE_URL as string | undefined;
// @ts-ignore - import.meta.env exists in Vite
const envAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallback apenas em DEV para não quebrar ambiente local antigo.
// Em produção, exige configuração via env.
const devFallbackUrl = 'https://usongmdiebxsfhcwdhiz.supabase.co';
const devFallbackAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzb25nbWRpZWJ4c2ZoY3dkaGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzA4NDgsImV4cCI6MjA4MDg0Njg0OH0.zi6G8CmogrgJeKEkWMVLx34H4aoL1ePLbAQbu8if44o';

// @ts-ignore - import.meta.env exists in Vite
const isDev = !!import.meta?.env?.DEV;

const supabaseUrl = envUrl || (isDev ? devFallbackUrl : '');
const supabaseAnonKey = envAnonKey || (isDev ? devFallbackAnonKey : '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
