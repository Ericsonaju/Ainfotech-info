-- ============================================
-- AINFOTECH E-COMMERCE - SCHEMA DO BANCO DE DADOS
-- Supabase PostgreSQL
-- ============================================
-- Localidade: Aracaju - Sergipe - Brasil
-- Legislação: CDC, LGPD, Marco Civil da Internet
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: products (Produtos Próprios - Domínio A)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technical_specs TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'outros',
    images JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Precificação
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 30,
    final_price DECIMAL(10, 2) GENERATED ALWAYS AS (
        cost_price * (1 + profit_margin / 100)
    ) STORED,
    
    -- Estoque
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    
    -- Logística
    warranty_days INTEGER NOT NULL DEFAULT 90,
    weight DECIMAL(6, 3) DEFAULT 0,
    dimensions JSONB DEFAULT '{"width": 0, "height": 0, "depth": 0}'::jsonb,
    
    -- Fiscal
    barcode VARCHAR(50),
    ncm VARCHAR(10),
    origin VARCHAR(20) DEFAULT 'national',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- ============================================
-- TABELA: affiliate_products (Produtos Afiliados - Domínio B)
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technical_specs TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'outros',
    images JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Afiliado
    affiliate_url TEXT NOT NULL,
    original_url TEXT NOT NULL,
    reference_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    seller VARCHAR(255),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    free_shipping BOOLEAN DEFAULT false,
    external_id VARCHAR(100),
    
    -- Sincronização
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    sync_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para affiliate_products
CREATE INDEX IF NOT EXISTS idx_affiliate_sku ON affiliate_products(sku);
CREATE INDEX IF NOT EXISTS idx_affiliate_category ON affiliate_products(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_status ON affiliate_products(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_external ON affiliate_products(external_id);

-- ============================================
-- TABELA: customers (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(18),
    
    -- Endereço
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    
    -- LGPD
    marketing_consent BOOLEAN DEFAULT false,
    data_processing_consent BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    consent_ip VARCHAR(45),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf_cnpj);

-- ============================================
-- TABELA: orders (Pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    -- Valores
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Pagamento
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Dados do cliente (snapshot)
    customer_snapshot JSONB NOT NULL,
    
    -- Notas
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- TABELA: order_items (Itens do Pedido)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- Snapshot do produto
    product_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- Valores
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- TABELA: legal_consents (Consentimentos Legais)
-- ============================================
CREATE TABLE IF NOT EXISTS legal_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    
    -- Consentimento
    consent_type VARCHAR(50) NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT false,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Rastreabilidade (LGPD)
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para legal_consents
CREATE INDEX IF NOT EXISTS idx_consents_order ON legal_consents(order_id);
CREATE INDEX IF NOT EXISTS idx_consents_customer ON legal_consents(customer_id);
CREATE INDEX IF NOT EXISTS idx_consents_type ON legal_consents(consent_type);

-- ============================================
-- TABELA: stock_history (Histórico de Estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason VARCHAR(20) NOT NULL,
    order_id UUID REFERENCES orders(id),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100)
);

-- Índices para stock_history
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON stock_history(created_at DESC);

-- ============================================
-- TABELA: price_history (Histórico de Preços)
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    previous_cost DECIMAL(10, 2),
    new_cost DECIMAL(10, 2),
    previous_margin DECIMAL(5, 2),
    new_margin DECIMAL(5, 2),
    previous_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100)
);

-- Índices para price_history
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(created_at DESC);

-- ============================================
-- TABELA: generated_ads (Anúncios Gerados por IA)
-- ============================================
CREATE TABLE IF NOT EXISTS generated_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID,
    product_type VARCHAR(20) NOT NULL, -- 'own' ou 'affiliate'
    
    -- Conteúdo
    headline VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    call_to_action VARCHAR(100),
    hashtags TEXT[],
    seo_keywords TEXT[],
    legal_disclaimer TEXT,
    
    -- Metadados
    platform VARCHAR(50) DEFAULT 'general',
    ai_model VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para generated_ads
CREATE INDEX IF NOT EXISTS idx_ads_product ON generated_ads(product_id);
CREATE INDEX IF NOT EXISTS idx_ads_platform ON generated_ads(platform);

-- ============================================
-- TABELA: ml_cache (Cache do Mercado Livre)
-- ============================================
CREATE TABLE IF NOT EXISTS ml_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url_hash VARCHAR(64) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    
    -- Dados extraídos
    extracted_data JSONB NOT NULL,
    
    -- Status
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Índices para ml_cache
CREATE INDEX IF NOT EXISTS idx_ml_cache_hash ON ml_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_ml_cache_expires ON ml_cache(expires_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
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
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para gerar número do pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
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
$$ LANGUAGE plpgsql;

-- Função para decrementar estoque após pedido
CREATE OR REPLACE FUNCTION decrement_stock_after_order()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION decrement_stock_after_order();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Garante schema público no SQL Editor/migrations
SET search_path = public;

-- Habilitar RLS em TODAS as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: PRODUCTS (Produtos Próprios)
-- ============================================
CREATE POLICY "Anon read products" ON public.products
    FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Auth manage products" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- POLÍTICAS: AFFILIATE_PRODUCTS (Produtos Afiliados)
-- ============================================
CREATE POLICY "Anon read affiliate_products" ON public.affiliate_products
    FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Auth manage affiliate_products" ON public.affiliate_products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- POLÍTICAS: ORDERS (Pedidos)
-- ============================================
CREATE POLICY "Auth manage orders" ON public.orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon create orders" ON public.orders
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon read orders" ON public.orders
    FOR SELECT TO anon USING (true);

-- ============================================
-- POLÍTICAS: ORDER_ITEMS (Itens do Pedido)
-- ============================================
CREATE POLICY "Auth manage order_items" ON public.order_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon create order_items" ON public.order_items
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon read order_items" ON public.order_items
    FOR SELECT TO anon USING (true);

-- ============================================
-- POLÍTICAS: CUSTOMERS (Clientes)
-- ============================================
CREATE POLICY "Auth manage customers" ON public.customers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon create customers" ON public.customers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon update customers" ON public.customers
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon select customers" ON public.customers
    FOR SELECT TO anon USING (true);

-- ============================================
-- POLÍTICAS: LEGAL_CONSENTS (Consentimentos)
-- ============================================
CREATE POLICY "Auth manage legal_consents" ON public.legal_consents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon create consents" ON public.legal_consents
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- POLÍTICAS: STOCK_HISTORY (Histórico Estoque)
-- ============================================
CREATE POLICY "Auth manage stock_history" ON public.stock_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon insert stock_history" ON public.stock_history
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- POLÍTICAS: PRICE_HISTORY (Histórico Preços)
-- ============================================
CREATE POLICY "Auth manage price_history" ON public.price_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- POLÍTICAS: GENERATED_ADS (Anúncios IA)
-- ============================================
CREATE POLICY "Auth manage generated_ads" ON public.generated_ads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon read generated_ads" ON public.generated_ads
    FOR SELECT TO anon USING (true);

CREATE POLICY "Anon insert generated_ads" ON public.generated_ads
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- POLÍTICAS: ML_CACHE (Cache ML)
-- ============================================
CREATE POLICY "Anon manage ml_cache" ON public.ml_cache
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Auth manage ml_cache" ON public.ml_cache
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================
COMMENT ON TABLE products IS 'Produtos próprios da AINFOTECH (Domínio A) - vendidos diretamente';
COMMENT ON TABLE affiliate_products IS 'Produtos afiliados do Mercado Livre (Domínio B) - apenas divulgação';
COMMENT ON TABLE orders IS 'Pedidos de produtos próprios - inclui snapshot do cliente para auditoria';
COMMENT ON TABLE legal_consents IS 'Registro de consentimentos para conformidade com CDC e LGPD';
COMMENT ON TABLE stock_history IS 'Histórico de movimentações de estoque para auditoria';
COMMENT ON TABLE ml_cache IS 'Cache de dados extraídos do Mercado Livre para otimização';
