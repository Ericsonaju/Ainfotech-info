import { createClient } from '@supabase/supabase-js';

// Credenciais via variáveis de ambiente (Vite)
// Em produção, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
// @ts-ignore - import.meta.env exists in Vite
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'https://usongmdiebxsfhcwdhiz.supabase.co';
// @ts-ignore - import.meta.env exists in Vite
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzb25nbWRpZWJ4c2ZoY3dkaGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzA4NDgsImV4cCI6MjA4MDg0Njg0OH0.zi6G8CmogrgJeKEkWMVLx34H4aoL1ePLbAQbu8if44o';

// Validação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
