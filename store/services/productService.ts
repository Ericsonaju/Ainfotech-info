/**
 * AINFOTECH E-COMMERCE - Serviço de Produtos
 * CRUD completo para produtos próprios e afiliados
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 */

import { supabase } from '../../services/supabase';
import {
  OwnProduct,
  AffiliateProduct,
  Product,
  ProductType,
  ProductStatus,
  ProductCategory,
  ProductFormData,
  AffiliateFormData,
  ApiResponse,
  PaginatedResponse,
  StockHistory,
  PriceHistory,
  ProductImage
} from '../types';

// ============================================
// MAPEAMENTO DB <-> APP
// ============================================

function mapOwnProductFromDB(dbProduct: any): OwnProduct {
  return {
    id: dbProduct.id,
    type: ProductType.OWN,
    sku: dbProduct.sku,
    name: dbProduct.name,
    description: dbProduct.description || '',
    technicalSpecs: dbProduct.technical_specs || '',
    category: dbProduct.category as ProductCategory,
    images: dbProduct.images || [],
    tags: dbProduct.tags || [],
    status: dbProduct.status as ProductStatus,
    costPrice: Number(dbProduct.cost_price) || 0,
    profitMargin: Number(dbProduct.profit_margin) || 30,
    finalPrice: Number(dbProduct.final_price) || 0,
    stockQuantity: dbProduct.stock_quantity || 0,
    minStockAlert: dbProduct.min_stock_alert || 5,
    warrantyDays: dbProduct.warranty_days || 90,
    weight: Number(dbProduct.weight) || 0,
    dimensions: dbProduct.dimensions || { width: 0, height: 0, depth: 0 },
    barcode: dbProduct.barcode,
    ncm: dbProduct.ncm,
    origin: dbProduct.origin || 'national',
    createdAt: new Date(dbProduct.created_at).getTime(),
    updatedAt: new Date(dbProduct.updated_at).getTime()
  };
}

function mapOwnProductToDB(product: Partial<OwnProduct>): Record<string, any> {
  const dbProduct: Record<string, any> = {};
  
  if (product.sku !== undefined) dbProduct.sku = product.sku;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.technicalSpecs !== undefined) dbProduct.technical_specs = product.technicalSpecs;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.images !== undefined) dbProduct.images = product.images;
  if (product.tags !== undefined) dbProduct.tags = product.tags;
  if (product.status !== undefined) dbProduct.status = product.status;
  if (product.costPrice !== undefined) dbProduct.cost_price = product.costPrice;
  if (product.profitMargin !== undefined) dbProduct.profit_margin = product.profitMargin;
  if (product.stockQuantity !== undefined) dbProduct.stock_quantity = product.stockQuantity;
  if (product.minStockAlert !== undefined) dbProduct.min_stock_alert = product.minStockAlert;
  if (product.warrantyDays !== undefined) dbProduct.warranty_days = product.warrantyDays;
  if (product.weight !== undefined) dbProduct.weight = product.weight;
  if (product.dimensions !== undefined) dbProduct.dimensions = product.dimensions;
  if (product.barcode !== undefined) dbProduct.barcode = product.barcode;
  if (product.ncm !== undefined) dbProduct.ncm = product.ncm;
  if (product.origin !== undefined) dbProduct.origin = product.origin;
  
  return dbProduct;
}

function mapAffiliateProductFromDB(dbProduct: any): AffiliateProduct {
  return {
    id: dbProduct.id,
    type: ProductType.AFFILIATE,
    sku: dbProduct.sku,
    name: dbProduct.name,
    description: dbProduct.description || '',
    technicalSpecs: dbProduct.technical_specs || '',
    category: dbProduct.category as ProductCategory,
    images: dbProduct.images || [],
    tags: dbProduct.tags || [],
    status: dbProduct.status as ProductStatus,
    affiliateUrl: dbProduct.affiliate_url,
    originalUrl: dbProduct.original_url,
    referencePrice: Number(dbProduct.reference_price) || 0,
    seller: dbProduct.seller || '',
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    freeShipping: dbProduct.free_shipping || false,
    externalId: dbProduct.external_id || '',
    lastSyncAt: new Date(dbProduct.last_sync_at).getTime(),
    createdAt: new Date(dbProduct.created_at).getTime(),
    updatedAt: new Date(dbProduct.updated_at).getTime()
  };
}

function mapAffiliateProductToDB(product: Partial<AffiliateProduct>): Record<string, any> {
  const dbProduct: Record<string, any> = {};
  
  if (product.sku !== undefined) dbProduct.sku = product.sku;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.technicalSpecs !== undefined) dbProduct.technical_specs = product.technicalSpecs;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.images !== undefined) dbProduct.images = product.images;
  if (product.tags !== undefined) dbProduct.tags = product.tags;
  if (product.status !== undefined) dbProduct.status = product.status;
  if (product.affiliateUrl !== undefined) dbProduct.affiliate_url = product.affiliateUrl;
  if (product.originalUrl !== undefined) dbProduct.original_url = product.originalUrl;
  if (product.referencePrice !== undefined) dbProduct.reference_price = product.referencePrice;
  if (product.seller !== undefined) dbProduct.seller = product.seller;
  if (product.rating !== undefined) dbProduct.rating = product.rating;
  if (product.reviewCount !== undefined) dbProduct.review_count = product.reviewCount;
  if (product.freeShipping !== undefined) dbProduct.free_shipping = product.freeShipping;
  if (product.externalId !== undefined) dbProduct.external_id = product.externalId;
  if (product.lastSyncAt !== undefined) dbProduct.last_sync_at = new Date(product.lastSyncAt).toISOString();
  
  return dbProduct;
}

// ============================================
// PRODUTOS PRÓPRIOS - CRUD
// ============================================

/**
 * Calcula o preço final automaticamente
 */
export function calculateFinalPrice(costPrice: number, profitMargin: number): number {
  return Number((costPrice * (1 + profitMargin / 100)).toFixed(2));
}

/**
 * Gera SKU único para produto
 */
export function generateSKU(category: ProductCategory, name: string): string {
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  
  return `${categoryPrefix}-${namePrefix}-${timestamp}${random}`;
}

/**
 * Busca todos os produtos próprios
 */
export async function fetchOwnProducts(options?: {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<OwnProduct>> {
  const { category, status, search, page = 1, pageSize = 20 } = options || {};
  
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });
  
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) throw new Error(error.message);
  
  return {
    data: (data || []).map(mapOwnProductFromDB),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

/**
 * Busca produto próprio por ID
 */
export async function fetchOwnProductById(id: string): Promise<OwnProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return mapOwnProductFromDB(data);
}

/**
 * Busca produto próprio por SKU
 */
export async function fetchOwnProductBySKU(sku: string): Promise<OwnProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();
  
  if (error || !data) return null;
  return mapOwnProductFromDB(data);
}

/**
 * Cria novo produto próprio
 */
export async function createOwnProduct(productData: ProductFormData): Promise<ApiResponse<OwnProduct>> {
  try {
    // Gera SKU se não fornecido
    const sku = productData.sku || generateSKU(productData.category, productData.name);
    
    // Verifica se SKU já existe
    const existing = await fetchOwnProductBySKU(sku);
    if (existing) {
      return { success: false, error: 'SKU já existe. Use outro código.' };
    }
    
    const dbProduct = mapOwnProductToDB({
      ...productData,
      sku,
      status: productData.status || ProductStatus.ACTIVE
    });
    
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      data: mapOwnProductFromDB(data),
      message: 'Produto criado com sucesso!'
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza produto próprio
 */
export async function updateOwnProduct(
  id: string,
  updates: Partial<OwnProduct>,
  recordPriceHistory: boolean = true
): Promise<ApiResponse<OwnProduct>> {
  try {
    // Busca produto atual para histórico
    const currentProduct = await fetchOwnProductById(id);
    if (!currentProduct) {
      return { success: false, error: 'Produto não encontrado.' };
    }
    
    // Registra histórico de preço se houve alteração
    if (recordPriceHistory && (
      updates.costPrice !== undefined ||
      updates.profitMargin !== undefined
    )) {
      const newCost = updates.costPrice ?? currentProduct.costPrice;
      const newMargin = updates.profitMargin ?? currentProduct.profitMargin;
      const newPrice = calculateFinalPrice(newCost, newMargin);
      
      if (newCost !== currentProduct.costPrice || newMargin !== currentProduct.profitMargin) {
        await supabase.from('price_history').insert([{
          product_id: id,
          previous_cost: currentProduct.costPrice,
          new_cost: newCost,
          previous_margin: currentProduct.profitMargin,
          new_margin: newMargin,
          previous_price: currentProduct.finalPrice,
          new_price: newPrice,
          created_by: 'admin'
        }]);
      }
    }
    
    const dbUpdates = mapOwnProductToDB(updates);
    
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      data: mapOwnProductFromDB(data),
      message: 'Produto atualizado com sucesso!'
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Exclui produto próprio
 */
export async function deleteOwnProduct(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Produto excluído com sucesso!' };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// ESTOQUE
// ============================================

/**
 * Atualiza estoque do produto
 */
export async function updateStock(
  productId: string,
  newQuantity: number,
  reason: 'sale' | 'adjustment' | 'return' | 'restock' | 'damage',
  orderId?: string,
  notes?: string
): Promise<ApiResponse<void>> {
  try {
    const product = await fetchOwnProductById(productId);
    if (!product) {
      return { success: false, error: 'Produto não encontrado.' };
    }
    
    // Bloqueia se nova quantidade for negativa
    if (newQuantity < 0) {
      return { success: false, error: 'Quantidade não pode ser negativa.' };
    }
    
    // Registra histórico
    await supabase.from('stock_history').insert([{
      product_id: productId,
      previous_quantity: product.stockQuantity,
      new_quantity: newQuantity,
      reason,
      order_id: orderId,
      notes,
      created_by: 'admin'
    }]);
    
    // Atualiza estoque
    const { error } = await supabase
      .from('products')
      .update({
        stock_quantity: newQuantity,
        status: newQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE
      })
      .eq('id', productId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Estoque atualizado!' };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verifica disponibilidade de estoque
 */
export async function checkStockAvailability(
  productId: string,
  quantity: number
): Promise<{ available: boolean; currentStock: number; message?: string }> {
  const product = await fetchOwnProductById(productId);
  
  if (!product) {
    return { available: false, currentStock: 0, message: 'Produto não encontrado.' };
  }
  
  if (product.status !== ProductStatus.ACTIVE) {
    return { available: false, currentStock: product.stockQuantity, message: 'Produto indisponível.' };
  }
  
  if (product.stockQuantity < quantity) {
    return {
      available: false,
      currentStock: product.stockQuantity,
      message: `Estoque insuficiente. Disponível: ${product.stockQuantity} unidades.`
    };
  }
  
  return { available: true, currentStock: product.stockQuantity };
}

/**
 * Busca produtos com estoque baixo
 */
export async function fetchLowStockProducts(): Promise<OwnProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lte('stock_quantity', supabase.rpc('min_stock_alert'))
    .eq('status', ProductStatus.ACTIVE);
  
  // Fallback se RPC não existir
  const { data: fallbackData } = await supabase
    .from('products')
    .select('*')
    .eq('status', ProductStatus.ACTIVE);
  
  const products = (fallbackData || []).filter(p => p.stock_quantity <= p.min_stock_alert);
  
  return products.map(mapOwnProductFromDB);
}

// ============================================
// PRODUTOS AFILIADOS - CRUD
// ============================================

/**
 * Busca todos os produtos afiliados
 */
export async function fetchAffiliateProducts(options?: {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AffiliateProduct>> {
  const { category, status, search, page = 1, pageSize = 20 } = options || {};
  
  let query = supabase
    .from('affiliate_products')
    .select('*', { count: 'exact' });
  
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) throw new Error(error.message);
  
  return {
    data: (data || []).map(mapAffiliateProductFromDB),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

/**
 * Busca produto afiliado por ID
 */
export async function fetchAffiliateProductById(id: string): Promise<AffiliateProduct | null> {
  const { data, error } = await supabase
    .from('affiliate_products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return mapAffiliateProductFromDB(data);
}

/**
 * Cria novo produto afiliado
 */
export async function createAffiliateProduct(productData: AffiliateFormData): Promise<ApiResponse<AffiliateProduct>> {
  try {
    const sku = productData.sku || `AFF-${Date.now().toString(36).toUpperCase()}`;
    
    const dbProduct = mapAffiliateProductToDB({
      ...productData,
      sku,
      status: productData.status || ProductStatus.ACTIVE,
      lastSyncAt: Date.now()
    });
    
    const { data, error } = await supabase
      .from('affiliate_products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      data: mapAffiliateProductFromDB(data),
      message: 'Produto afiliado criado com sucesso!'
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza produto afiliado
 */
export async function updateAffiliateProduct(
  id: string,
  updates: Partial<AffiliateProduct>
): Promise<ApiResponse<AffiliateProduct>> {
  try {
    const dbUpdates = mapAffiliateProductToDB(updates);
    
    const { data, error } = await supabase
      .from('affiliate_products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      data: mapAffiliateProductFromDB(data),
      message: 'Produto afiliado atualizado!'
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Exclui produto afiliado
 */
export async function deleteAffiliateProduct(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('affiliate_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Produto afiliado excluído!' };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HISTÓRICOS
// ============================================

/**
 * Busca histórico de preços do produto
 */
export async function fetchPriceHistory(productId: string): Promise<PriceHistory[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) return [];
  
  return (data || []).map(h => ({
    id: h.id,
    productId: h.product_id,
    previousCost: Number(h.previous_cost),
    newCost: Number(h.new_cost),
    previousMargin: Number(h.previous_margin),
    newMargin: Number(h.new_margin),
    previousPrice: Number(h.previous_price),
    newPrice: Number(h.new_price),
    reason: h.reason,
    createdAt: new Date(h.created_at).getTime(),
    createdBy: h.created_by
  }));
}

/**
 * Busca histórico de estoque do produto
 */
export async function fetchStockHistory(productId: string): Promise<StockHistory[]> {
  const { data, error } = await supabase
    .from('stock_history')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) return [];
  
  return (data || []).map(h => ({
    id: h.id,
    productId: h.product_id,
    previousQuantity: h.previous_quantity,
    newQuantity: h.new_quantity,
    reason: h.reason,
    orderId: h.order_id,
    notes: h.notes,
    createdAt: new Date(h.created_at).getTime(),
    createdBy: h.created_by
  }));
}

// ============================================
// EXPORT
// ============================================

export const productService = {
  // Utilidades
  calculateFinalPrice,
  generateSKU,
  
  // Produtos Próprios
  fetchOwnProducts,
  fetchOwnProductById,
  fetchOwnProductBySKU,
  createOwnProduct,
  updateOwnProduct,
  deleteOwnProduct,
  
  // Estoque
  updateStock,
  checkStockAvailability,
  fetchLowStockProducts,
  
  // Afiliados
  fetchAffiliateProducts,
  fetchAffiliateProductById,
  createAffiliateProduct,
  updateAffiliateProduct,
  deleteAffiliateProduct,
  
  // Históricos
  fetchPriceHistory,
  fetchStockHistory
};
