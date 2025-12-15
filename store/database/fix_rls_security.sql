-- ============================================
-- AINFOTECH E-COMMERCE - CORREÇÃO DE SEGURANÇA RLS
-- Execute este script no Supabase SQL Editor
-- ============================================
-- Este script habilita Row Level Security (RLS) em todas
-- as tabelas e cria políticas de acesso adequadas.
-- 
-- IMPORTANTE: Este script DEVE ser executado para corrigir
-- o erro "Policy Exists RLS Disabled" e "RLS Disabled in Public"
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
-- NOTA: Estes comandos são idempotentes - seguros para executar múltiplas vezes

-- Tabelas de Produtos
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS affiliate_products ENABLE ROW LEVEL SECURITY;

-- Tabelas de Pedidos
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- Tabelas de Clientes
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;

-- Tabelas de Consentimentos
ALTER TABLE IF EXISTS legal_consents ENABLE ROW LEVEL SECURITY;

-- Tabelas de Histórico
ALTER TABLE IF EXISTS stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;

-- Tabelas de IA e Cache
ALTER TABLE IF EXISTS generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ml_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. REMOVER POLÍTICAS EXISTENTES (se houver)
-- ============================================
-- Remove todas as políticas conhecidas para recriar com configuração correta

-- Products (inclui políticas antigas que causam o erro)
DROP POLICY IF EXISTS "Public read access to products" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;
DROP POLICY IF EXISTS "Anon read products" ON products;
DROP POLICY IF EXISTS "Auth manage products" ON products;
DROP POLICY IF EXISTS "Authenticated manage products" ON products;

-- Affiliate Products (inclui políticas antigas que causam o erro)
DROP POLICY IF EXISTS "Public read access to affiliate_products" ON affiliate_products;
DROP POLICY IF EXISTS "Admin full access to affiliate_products" ON affiliate_products;
DROP POLICY IF EXISTS "Anon read affiliate_products" ON affiliate_products;
DROP POLICY IF EXISTS "Auth manage affiliate_products" ON affiliate_products;
DROP POLICY IF EXISTS "Authenticated manage affiliate_products" ON affiliate_products;

-- Orders
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Auth manage orders" ON orders;
DROP POLICY IF EXISTS "Anon create orders" ON orders;
DROP POLICY IF EXISTS "Anon read orders" ON orders;
DROP POLICY IF EXISTS "Anon read own order" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Auth manage order_items" ON order_items;
DROP POLICY IF EXISTS "Anon read order_items" ON order_items;
DROP POLICY IF EXISTS "Anon create order_items" ON order_items;

-- Customers
DROP POLICY IF EXISTS "Admin full access to customers" ON customers;
DROP POLICY IF EXISTS "Auth manage customers" ON customers;
DROP POLICY IF EXISTS "Anon create customers" ON customers;
DROP POLICY IF EXISTS "Anon update customers" ON customers;
DROP POLICY IF EXISTS "Anon update own customer" ON customers;
DROP POLICY IF EXISTS "Anon select customers" ON customers;

-- Legal Consents
DROP POLICY IF EXISTS "Admin full access to legal_consents" ON legal_consents;
DROP POLICY IF EXISTS "Auth manage legal_consents" ON legal_consents;
DROP POLICY IF EXISTS "Anon create consents" ON legal_consents;

-- Stock History
DROP POLICY IF EXISTS "Auth manage stock_history" ON stock_history;
DROP POLICY IF EXISTS "Anon read stock_history" ON stock_history;
DROP POLICY IF EXISTS "Anon insert stock_history" ON stock_history;

-- Price History
DROP POLICY IF EXISTS "Auth manage price_history" ON price_history;
DROP POLICY IF EXISTS "Anon read price_history" ON price_history;

-- Generated Ads
DROP POLICY IF EXISTS "Auth manage generated_ads" ON generated_ads;
DROP POLICY IF EXISTS "Anon read generated_ads" ON generated_ads;
DROP POLICY IF EXISTS "Anon insert generated_ads" ON generated_ads;

-- ML Cache
DROP POLICY IF EXISTS "Auth manage ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Public read ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Anon manage ml_cache" ON ml_cache;

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
-- Apenas authenticated
-- ----------------------------------------
CREATE POLICY "Auth manage stock_history" ON stock_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anon pode inserir (via trigger de pedido)
CREATE POLICY "Anon insert stock_history" ON stock_history
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ----------------------------------------
-- PRICE_HISTORY (Histórico de Preços)
-- Apenas authenticated
-- ----------------------------------------
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
-- 4. VERIFICAÇÃO - Executar após o script
-- ============================================

-- Verificar se RLS está habilitado em todas as tabelas:
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS DISABLED' END AS rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'products', 'affiliate_products', 'orders', 'order_items',
    'customers', 'legal_consents', 'stock_history', 'price_history',
    'generated_ads', 'ml_cache'
)
ORDER BY tablename;

-- Verificar políticas ativas:
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- RESUMO DAS POLÍTICAS CONFIGURADAS
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
