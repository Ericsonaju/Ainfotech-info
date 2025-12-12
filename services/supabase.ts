import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas
const supabaseUrl = 'https://usongmdiebxsfhcwdhiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzb25nbWRpZWJ4c2ZoY3dkaGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzA4NDgsImV4cCI6MjA4MDg0Njg0OH0.zi6G8CmogrgJeKEkWMVLx34H4aoL1ePLbAQbu8if44o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
