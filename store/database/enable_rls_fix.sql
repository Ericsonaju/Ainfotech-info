-- ============================================
-- CORREÇÃO RÁPIDA DE RLS - RESOLVE ERROS DO LINTER
-- Execute este script no Supabase SQL Editor
-- ============================================
-- Este script resolve especificamente os erros:
-- 1. policy_exists_rls_disabled (products, affiliate_products)
-- 2. rls_disabled_in_public (todas as tabelas mencionadas)
-- ============================================

-- ============================================
-- PASSO 1: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
-- Isso resolve o erro "rls_disabled_in_public"

ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ml_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 2: REMOVER POLÍTICAS ANTIGAS PROBLEMÁTICAS
-- ============================================
-- Remove a política "Public read access to products" que causa conflito

DROP POLICY IF EXISTS "Public read access to products" ON products;
DROP POLICY IF EXISTS "Public read access to affiliate_products" ON affiliate_products;

-- ============================================
-- PASSO 3: CRIAR POLÍTICAS CORRETAS
-- ============================================
-- Garante que todas as tabelas tenham políticas adequadas

-- Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Anon read products'
    ) THEN
        CREATE POLICY "Anon read products" ON products
            FOR SELECT TO anon
            USING (status = 'active');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Auth manage products'
    ) THEN
        CREATE POLICY "Auth manage products" ON products
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Affiliate Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'affiliate_products' 
        AND policyname = 'Anon read affiliate_products'
    ) THEN
        CREATE POLICY "Anon read affiliate_products" ON affiliate_products
            FOR SELECT TO anon
            USING (status = 'active');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'affiliate_products' 
        AND policyname = 'Auth manage affiliate_products'
    ) THEN
        CREATE POLICY "Auth manage affiliate_products" ON affiliate_products
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Order Items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND policyname = 'Anon read order_items'
    ) THEN
        CREATE POLICY "Anon read order_items" ON order_items
            FOR SELECT TO anon
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND policyname = 'Anon create order_items'
    ) THEN
        CREATE POLICY "Anon create order_items" ON order_items
            FOR INSERT TO anon
            WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND policyname = 'Auth manage order_items'
    ) THEN
        CREATE POLICY "Auth manage order_items" ON order_items
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Stock History
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'stock_history' 
        AND policyname = 'Anon read stock_history'
    ) THEN
        CREATE POLICY "Anon read stock_history" ON stock_history
            FOR SELECT TO anon
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'stock_history' 
        AND policyname = 'Anon insert stock_history'
    ) THEN
        CREATE POLICY "Anon insert stock_history" ON stock_history
            FOR INSERT TO anon
            WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'stock_history' 
        AND policyname = 'Auth manage stock_history'
    ) THEN
        CREATE POLICY "Auth manage stock_history" ON stock_history
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Price History
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'price_history' 
        AND policyname = 'Anon read price_history'
    ) THEN
        CREATE POLICY "Anon read price_history" ON price_history
            FOR SELECT TO anon
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'price_history' 
        AND policyname = 'Auth manage price_history'
    ) THEN
        CREATE POLICY "Auth manage price_history" ON price_history
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Generated Ads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'generated_ads' 
        AND policyname = 'Anon read generated_ads'
    ) THEN
        CREATE POLICY "Anon read generated_ads" ON generated_ads
            FOR SELECT TO anon
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'generated_ads' 
        AND policyname = 'Anon insert generated_ads'
    ) THEN
        CREATE POLICY "Anon insert generated_ads" ON generated_ads
            FOR INSERT TO anon
            WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'generated_ads' 
        AND policyname = 'Auth manage generated_ads'
    ) THEN
        CREATE POLICY "Auth manage generated_ads" ON generated_ads
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ML Cache
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'ml_cache' 
        AND policyname = 'Anon manage ml_cache'
    ) THEN
        CREATE POLICY "Anon manage ml_cache" ON ml_cache
            FOR ALL TO anon
            USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'ml_cache' 
        AND policyname = 'Auth manage ml_cache'
    ) THEN
        CREATE POLICY "Auth manage ml_cache" ON ml_cache
            FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute este SELECT para verificar se o RLS está habilitado em todas as tabelas

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'products',
        'affiliate_products',
        'order_items',
        'stock_history',
        'price_history',
        'generated_ads',
        'ml_cache'
    )
ORDER BY tablename;
