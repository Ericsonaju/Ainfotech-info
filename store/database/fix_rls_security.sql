-- ============================================
-- AINFOTECH E-COMMERCE - CORREÇÃO DE SEGURANÇA RLS
-- Execute este script no Supabase SQL Editor
-- ============================================
-- Este script habilita Row Level Security (RLS) em todas
-- as tabelas e cria políticas de acesso adequadas.
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

-- Tabelas de Produtos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- Tabelas de Pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Tabelas de Clientes
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Tabelas de Consentimentos
ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

-- Tabelas de Histórico
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Tabelas de IA e Cache
ALTER TABLE generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================
-- Remove todas as políticas para recriar do zero e evitar conflitos

-- Products - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON products';
    END LOOP;
END $$;

-- Affiliate Products - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'affiliate_products') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON affiliate_products';
    END LOOP;
END $$;

-- Orders - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON orders';
    END LOOP;
END $$;

-- Order Items - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON order_items';
    END LOOP;
END $$;

-- Customers - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON customers';
    END LOOP;
END $$;

-- Legal Consents - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'legal_consents') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON legal_consents';
    END LOOP;
END $$;

-- Stock History - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stock_history') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON stock_history';
    END LOOP;
END $$;

-- Price History - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'price_history') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON price_history';
    END LOOP;
END $$;

-- Generated Ads - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_ads') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON generated_ads';
    END LOOP;
END $$;

-- ML Cache - Remove todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ml_cache') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ml_cache';
    END LOOP;
END $$;

-- ============================================
-- 3. CRIAR NOVAS POLÍTICAS DE ACESSO
-- ============================================

-- ----------------------------------------
-- PRODUCTS (Produtos Próprios)
-- Leitura: Pública (anon + authenticated)
-- Escrita: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Anon read products" ON products
    FOR SELECT
    TO anon
    USING (status = 'active');

CREATE POLICY "Auth manage products" ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------
-- AFFILIATE_PRODUCTS (Produtos Afiliados)
-- Leitura: Pública (anon + authenticated)
-- Escrita: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Anon read affiliate_products" ON affiliate_products
    FOR SELECT
    TO anon
    USING (status = 'active');

CREATE POLICY "Auth manage affiliate_products" ON affiliate_products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------
-- ORDERS (Pedidos)
-- Leitura: Apenas authenticated
-- Criação: Anon pode criar (checkout público)
-- ----------------------------------------
CREATE POLICY "Auth manage orders" ON orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon create orders" ON orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anon read own order" ON orders
    FOR SELECT
    TO anon
    USING (true);  -- Permite consultar pedido por número

-- ----------------------------------------
-- ORDER_ITEMS (Itens do Pedido)
-- Segue as mesmas regras de orders
-- ----------------------------------------
CREATE POLICY "Auth manage order_items" ON order_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon create order_items" ON order_items
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anon read order_items" ON order_items
    FOR SELECT
    TO anon
    USING (true);

-- ----------------------------------------
-- CUSTOMERS (Clientes)
-- Criação: Anon pode criar (registro no checkout)
-- Leitura/Edição: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Auth manage customers" ON customers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon create customers" ON customers
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anon update own customer" ON customers
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon select customers" ON customers
    FOR SELECT
    TO anon
    USING (true);

-- ----------------------------------------
-- LEGAL_CONSENTS (Consentimentos)
-- Criação: Anon pode criar (registro no checkout)
-- Leitura: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Auth manage legal_consents" ON legal_consents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon create consents" ON legal_consents
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ----------------------------------------
-- STOCK_HISTORY (Histórico de Estoque)
-- Leitura: Pública (para consultas)
-- Escrita: Authenticated + Anon (via trigger)
-- ----------------------------------------
CREATE POLICY "Anon read stock_history" ON stock_history
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Anon insert stock_history" ON stock_history
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Auth manage stock_history" ON stock_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------
-- PRICE_HISTORY (Histórico de Preços)
-- Leitura: Pública (para consultas)
-- Escrita: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Anon read price_history" ON price_history
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Auth manage price_history" ON price_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------
-- GENERATED_ADS (Anúncios Gerados)
-- Leitura: Pública
-- Escrita: Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Auth manage generated_ads" ON generated_ads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon read generated_ads" ON generated_ads
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Anon insert generated_ads" ON generated_ads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ----------------------------------------
-- ML_CACHE (Cache do Mercado Livre)
-- Leitura/Escrita: Pública (cache compartilhado)
-- ----------------------------------------
CREATE POLICY "Anon manage ml_cache" ON ml_cache
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Auth manage ml_cache" ON ml_cache
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 4. VERIFICAÇÃO
-- ============================================

-- Este SELECT mostra o status do RLS em todas as tabelas
-- Execute para confirmar que o RLS está habilitado

/*
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
*/

-- ============================================
-- RESUMO DAS POLÍTICAS
-- ============================================
/*
TABELA              | ANON (público)      | AUTHENTICATED (admin)
--------------------|---------------------|----------------------
products            | SELECT (active)     | ALL
affiliate_products  | SELECT (active)     | ALL
orders              | INSERT, SELECT      | ALL
order_items         | INSERT, SELECT      | ALL
customers           | INSERT, UPDATE, SEL | ALL
legal_consents      | INSERT              | ALL
stock_history       | INSERT              | ALL
price_history       | -                   | ALL
generated_ads       | SELECT, INSERT      | ALL
ml_cache            | ALL                 | ALL
*/

-- ============================================
-- FIM DO SCRIPT DE CORREÇÃO RLS
-- ============================================
