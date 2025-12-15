-- ============================================
-- AINFOTECH E-COMMERCE - CORREÇÃO DE SEGURANÇA FUNÇÕES
-- Execute este script no Supabase SQL Editor
-- ============================================
-- Este script corrige o aviso "function_search_path_mutable"
-- definindo search_path fixo para todas as funções.
-- ============================================

-- ============================================
-- 1. RECRIAR FUNÇÃO: update_updated_at_column
-- ============================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recriar triggers que usam esta função
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_products_updated_at
    BEFORE UPDATE ON affiliate_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. RECRIAR FUNÇÃO: generate_order_number
-- ============================================
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part INTEGER;
    order_num VARCHAR(20);
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 10 FOR 4) AS INTEGER)
    ), 0) + 1
    INTO sequence_part
    FROM orders
    WHERE order_number LIKE 'PED-' || year_part || '-%';
    
    order_num := 'PED-' || year_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$;

-- ============================================
-- 3. RECRIAR FUNÇÃO: decrement_stock_after_order
-- ============================================
DROP FUNCTION IF EXISTS decrement_stock_after_order() CASCADE;

CREATE OR REPLACE FUNCTION decrement_stock_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualiza o estoque do produto
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Registra no histórico
    INSERT INTO stock_history (product_id, previous_quantity, new_quantity, reason, order_id)
    SELECT 
        NEW.product_id,
        stock_quantity + NEW.quantity,
        stock_quantity,
        'sale',
        NEW.order_id
    FROM products
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER trigger_decrement_stock
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION decrement_stock_after_order();

-- ============================================
-- 4. VERIFICAÇÃO
-- ============================================
-- Execute para verificar que as funções têm search_path definido:

/*
SELECT 
    proname as function_name,
    proconfig as config
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
    'update_updated_at_column',
    'generate_order_number', 
    'decrement_stock_after_order'
);
*/

-- ============================================
-- NOTA SOBRE auth_leaked_password_protection
-- ============================================
-- O aviso "Leaked Password Protection Disabled" deve ser
-- habilitado no painel do Supabase:
-- 
-- 1. Acesse: Dashboard > Authentication > Settings
-- 2. Na seção "Security", habilite "Leaked Password Protection"
-- 3. Isso verifica senhas contra o banco HaveIBeenPwned.org
--
-- Esta é uma configuração de UI, não de SQL.
-- ============================================

-- ============================================
-- FIM DO SCRIPT
-- ============================================
