import { createClient } from '@supabase/supabase-js';

// CRÍTICO: Usar variáveis de ambiente em vez de valores hardcoded
// As credenciais devem estar no arquivo .env (não commitado)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase não configuradas!\n' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env\n' +
    'Veja o arquivo .env.example para referência.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
