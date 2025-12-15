-- ============================================
-- CORREÇÃO DE SEGURANÇA RLS (Remediação de Erros)
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Habilitar RLS em todas as tabelas reportadas e relacionadas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;

-- 2. Recriar Políticas para garantir consistência

-- Products
DROP POLICY IF EXISTS "Anon read products" ON products;
CREATE POLICY "Anon read products" ON products FOR SELECT TO anon USING (status = 'active');

DROP POLICY IF EXISTS "Auth manage products" ON products;
CREATE POLICY "Auth manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Affiliate Products
DROP POLICY IF EXISTS "Anon read affiliate_products" ON affiliate_products;
CREATE POLICY "Anon read affiliate_products" ON affiliate_products FOR SELECT TO anon USING (status = 'active');

DROP POLICY IF EXISTS "Auth manage affiliate_products" ON affiliate_products;
CREATE POLICY "Auth manage affiliate_products" ON affiliate_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "Auth manage orders" ON orders;
CREATE POLICY "Auth manage orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon create orders" ON orders;
CREATE POLICY "Anon create orders" ON orders FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon read own order" ON orders;
CREATE POLICY "Anon read own order" ON orders FOR SELECT TO anon USING (true);

-- Order Items
DROP POLICY IF EXISTS "Auth manage order_items" ON order_items;
CREATE POLICY "Auth manage order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon create order_items" ON order_items;
CREATE POLICY "Anon create order_items" ON order_items FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon read order_items" ON order_items;
CREATE POLICY "Anon read order_items" ON order_items FOR SELECT TO anon USING (true);

-- Customers
DROP POLICY IF EXISTS "Auth manage customers" ON customers;
CREATE POLICY "Auth manage customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon create customers" ON customers;
CREATE POLICY "Anon create customers" ON customers FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon update own customer" ON customers;
CREATE POLICY "Anon update own customer" ON customers FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon select customers" ON customers;
CREATE POLICY "Anon select customers" ON customers FOR SELECT TO anon USING (true);

-- Legal Consents
DROP POLICY IF EXISTS "Auth manage legal_consents" ON legal_consents;
CREATE POLICY "Auth manage legal_consents" ON legal_consents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon create consents" ON legal_consents;
CREATE POLICY "Anon create consents" ON legal_consents FOR INSERT TO anon WITH CHECK (true);

-- Stock History
DROP POLICY IF EXISTS "Auth manage stock_history" ON stock_history;
CREATE POLICY "Auth manage stock_history" ON stock_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon insert stock_history" ON stock_history;
CREATE POLICY "Anon insert stock_history" ON stock_history FOR INSERT TO anon WITH CHECK (true);

-- Price History
DROP POLICY IF EXISTS "Auth manage price_history" ON price_history;
CREATE POLICY "Auth manage price_history" ON price_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Generated Ads
DROP POLICY IF EXISTS "Auth manage generated_ads" ON generated_ads;
CREATE POLICY "Auth manage generated_ads" ON generated_ads FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon read generated_ads" ON generated_ads;
CREATE POLICY "Anon read generated_ads" ON generated_ads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon insert generated_ads" ON generated_ads;
CREATE POLICY "Anon insert generated_ads" ON generated_ads FOR INSERT TO anon WITH CHECK (true);

-- ML Cache
DROP POLICY IF EXISTS "Anon manage ml_cache" ON ml_cache;
CREATE POLICY "Anon manage ml_cache" ON ml_cache FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth manage ml_cache" ON ml_cache;
CREATE POLICY "Auth manage ml_cache" ON ml_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);
