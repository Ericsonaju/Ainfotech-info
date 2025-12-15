/**
 * AINFOTECH E-COMMERCE - TIPOS E INTERFACES
 * Plataforma de Vendas com Produtos Próprios e Afiliados
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 * @legislation CDC, LGPD, Marco Civil da Internet
 */

// ============================================
// ENUMS
// ============================================

export enum ProductType {
  OWN = 'own',           // Produto próprio (Domínio A)
  AFFILIATE = 'affiliate' // Produto afiliado (Domínio B)
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  PENDING_REVIEW = 'pending_review'
}

export enum ProductCategory {
  NOTEBOOKS = 'notebooks',
  DESKTOPS = 'desktops',
  SMARTPHONES = 'smartphones',
  TABLETS = 'tablets',
  ACESSORIOS = 'acessorios',
  PERIFERICOS = 'perifericos',
  REDES = 'redes',
  ARMAZENAMENTO = 'armazenamento',
  COMPONENTES = 'componentes',
  SOFTWARE = 'software',
  SERVICOS = 'servicos',
  OUTROS = 'outros'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BOLETO = 'boleto',
  CASH = 'cash'
}

export enum ConsentType {
  PURCHASE = 'purchase',
  WARRANTY = 'warranty',
  DATA_PROCESSING = 'data_processing',
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy'
}

// ============================================
// INTERFACES - PRODUTOS
// ============================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductBase {
  id: string;
  sku: string;
  name: string;
  description: string;
  technicalSpecs: string;
  category: ProductCategory;
  images: ProductImage[];
  tags: string[];
  status: ProductStatus;
  createdAt: number;
  updatedAt: number;
}

// Produto Próprio (Domínio A)
export interface OwnProduct extends ProductBase {
  type: ProductType.OWN;
  costPrice: number;           // Custo do produto
  profitMargin: number;        // Margem de lucro em %
  finalPrice: number;          // Preço final (calculado)
  stockQuantity: number;       // Quantidade em estoque
  minStockAlert: number;       // Alerta de estoque mínimo
  warrantyDays: number;        // Dias de garantia
  weight: number;              // Peso em kg (para frete)
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  barcode?: string;
  ncm?: string;                // Nomenclatura Comum do Mercosul
  origin: 'national' | 'imported';
}

// Produto Afiliado (Domínio B - Mercado Livre)
export interface AffiliateProduct extends ProductBase {
  type: ProductType.AFFILIATE;
  affiliateUrl: string;        // Link de afiliado
  originalUrl: string;         // URL original do produto
  referencePrice: number;      // Preço de referência (não vendemos)
  seller: string;              // Nome do vendedor no ML
  rating?: number;             // Avaliação do produto
  reviewCount?: number;        // Quantidade de reviews
  freeShipping?: boolean;      // Frete grátis
  lastSyncAt: number;          // Última sincronização
  externalId: string;          // ID do produto no ML
}

export type Product = OwnProduct | AffiliateProduct;

// ============================================
// INTERFACES - CARRINHO
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  product: OwnProduct;         // Apenas produtos próprios no carrinho
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// INTERFACES - PEDIDOS
// ============================================

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface LegalConsent {
  id: string;
  type: ConsentType;
  accepted: boolean;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  version: string;            // Versão do termo aceito
}

export interface Order {
  id: string;
  orderNumber: string;        // Número legível (ex: PED-2024-0001)
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  consents: LegalConsent[];   // Consentimentos do cliente
  notes?: string;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  shippedAt?: number;
  deliveredAt?: number;
}

// ============================================
// INTERFACES - EXTRAÇÃO MERCADO LIVRE
// ============================================

export interface MLProductData {
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  seller: string;
  rating?: number;
  reviewCount?: number;
  freeShipping: boolean;
  productId: string;
  categoryPath?: string[];
  attributes?: Record<string, string>;
}

export interface MLExtractionResult {
  success: boolean;
  data?: MLProductData;
  error?: string;
  cachedAt?: number;
}

// ============================================
// INTERFACES - IA / ANÚNCIOS
// ============================================

export interface AdPromptInput {
  product: Product;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'luxury';
  platform?: 'instagram' | 'facebook' | 'google' | 'whatsapp' | 'general';
  maxLength?: number;
}

export interface GeneratedAd {
  id: string;
  productId: string;
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  seoKeywords: string[];
  legalDisclaimer: string;
  platform: string;
  createdAt: number;
  aiModel: string;
}

// ============================================
// INTERFACES - LOGS E AUDITORIA
// ============================================

export interface StockHistory {
  id: string;
  productId: string;
  previousQuantity: number;
  newQuantity: number;
  reason: 'sale' | 'adjustment' | 'return' | 'restock' | 'damage';
  orderId?: string;
  notes?: string;
  createdAt: number;
  createdBy: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  previousCost: number;
  newCost: number;
  previousMargin: number;
  newMargin: number;
  previousPrice: number;
  newPrice: number;
  reason?: string;
  createdAt: number;
  createdBy: string;
}

// ============================================
// INTERFACES - CHECKOUT STEPS
// ============================================

export interface CheckoutStep {
  id: string;
  name: string;
  completed: boolean;
  timestamp?: number;
  data?: Record<string, unknown>;
}

export interface CheckoutState {
  currentStep: number;
  steps: CheckoutStep[];
  cart: Cart;
  customer?: CustomerInfo;
  paymentMethod?: PaymentMethod;
  consents: LegalConsent[];
  isComplete: boolean;
}

// ============================================
// TIPOS UTILITÁRIOS
// ============================================

export type ProductFormData = Omit<OwnProduct, 'id' | 'finalPrice' | 'createdAt' | 'updatedAt'>;
export type AffiliateFormData = Omit<AffiliateProduct, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncAt'>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
