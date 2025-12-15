/**
 * AINFOTECH E-COMMERCE - Serviço do Mercado Livre
 * Extração automática de dados de links de afiliado
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 */

import { supabase } from '../../services/supabase';
import { MLProductData, MLExtractionResult, AffiliateProduct, ProductCategory, ProductStatus, ProductType } from '../types';

// Configurações
const ML_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms
const IMAGE_CACHE_ENABLED = true;

/**
 * Valida se a URL é do Mercado Livre
 */
export function isValidMLUrl(url: string): boolean {
  const mlPatterns = [
    /^https?:\/\/(www\.)?mercadolivre\.com\.br\//,
    /^https?:\/\/(www\.)?mercadolibre\.com/,
    /^https?:\/\/produto\.mercadolivre\.com\.br\//,
    /^https?:\/\/lista\.mercadolivre\.com\.br\//,
    /^https?:\/\/articulo\.mercadolibre\.com/
  ];
  
  return mlPatterns.some(pattern => pattern.test(url));
}

/**
 * Extrai o ID do produto da URL do Mercado Livre
 */
export function extractProductId(url: string): string | null {
  // Padrão: MLB-1234567890 ou MLB1234567890
  const patterns = [
    /MLB-?(\d+)/i,
    /\/p\/([A-Z]{3}\d+)/i,
    /item_id=([A-Z]{3}\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].replace(/-/g, '');
    }
  }
  
  return null;
}

/**
 * Gera hash da URL para cache
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Verifica cache do Mercado Livre
 */
async function checkCache(url: string): Promise<MLExtractionResult | null> {
  try {
    const urlHash = hashUrl(url);
    
    const { data, error } = await supabase
      .from('ml_cache')
      .select('*')
      .eq('url_hash', urlHash)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) return null;
    
    return {
      success: data.success,
      data: data.extracted_data as MLProductData,
      cachedAt: new Date(data.created_at).getTime()
    };
  } catch {
    return null;
  }
}

/**
 * Salva no cache do Mercado Livre
 */
async function saveToCache(url: string, result: MLExtractionResult): Promise<void> {
  try {
    const urlHash = hashUrl(url);
    
    await supabase
      .from('ml_cache')
      .upsert({
        url_hash: urlHash,
        original_url: url,
        extracted_data: result.data || {},
        success: result.success,
        error_message: result.error,
        expires_at: new Date(Date.now() + ML_CACHE_DURATION).toISOString()
      }, { onConflict: 'url_hash' });
  } catch (e) {
    console.error('[ML Cache] Erro ao salvar cache:', e);
  }
}

/**
 * Extrai dados do produto via API pública do Mercado Livre
 * Usa a API oficial quando possível, com fallback para parsing
 */
async function extractFromAPI(productId: string): Promise<MLExtractionResult> {
  try {
    // API pública do Mercado Livre
    const apiUrl = `https://api.mercadolibre.com/items/MLB${productId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapeia os dados da API para nosso formato
    const productData: MLProductData = {
      title: data.title || 'Produto sem título',
      price: data.price || 0,
      originalPrice: data.original_price || data.price,
      images: (data.pictures || []).map((pic: any) => pic.secure_url || pic.url),
      description: data.title, // Descrição requer outra chamada
      seller: data.seller_id?.toString() || 'Vendedor',
      rating: null, // Requer API adicional
      reviewCount: null,
      freeShipping: data.shipping?.free_shipping || false,
      productId: data.id,
      categoryPath: data.category_id ? [data.category_id] : [],
      attributes: {}
    };
    
    // Extrai atributos relevantes
    if (data.attributes && Array.isArray(data.attributes)) {
      data.attributes.forEach((attr: any) => {
        if (attr.name && attr.value_name) {
          productData.attributes![attr.name] = attr.value_name;
        }
      });
    }
    
    // Busca descrição completa (API separada)
    try {
      const descResponse = await fetch(`https://api.mercadolibre.com/items/MLB${productId}/description`);
      if (descResponse.ok) {
        const descData = await descResponse.json();
        productData.description = descData.plain_text || descData.text || productData.title;
      }
    } catch {
      // Mantém descrição padrão
    }
    
    return {
      success: true,
      data: productData
    };
    
  } catch (error: any) {
    console.error('[ML API] Erro ao extrair dados:', error);
    return {
      success: false,
      error: error.message || 'Erro ao acessar API do Mercado Livre'
    };
  }
}

/**
 * Fallback: Extrai dados básicos da página (quando API falha)
 * Usa meta tags OpenGraph
 */
async function extractFromMetaTags(url: string): Promise<MLExtractionResult> {
  try {
    // Usa um proxy CORS ou API de scraping
    // Em produção, isso seria feito via backend/serverless function
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, { 
      signal: AbortSignal.timeout(10000) 
    });
    
    if (!response.ok) {
      throw new Error('Falha ao acessar página');
    }
    
    const html = await response.text();
    
    // Extrai meta tags
    const getMetaContent = (name: string): string => {
      const patterns = [
        new RegExp(`<meta\\s+property="${name}"\\s+content="([^"]*)"`, 'i'),
        new RegExp(`<meta\\s+content="([^"]*)"\\s+property="${name}"`, 'i'),
        new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return '';
    };
    
    const title = getMetaContent('og:title') || getMetaContent('title');
    const image = getMetaContent('og:image');
    const description = getMetaContent('og:description') || getMetaContent('description');
    
    // Extrai preço (padrão brasileiro)
    const priceMatch = html.match(/R\$\s*([\d.,]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace('.', '').replace(',', '.')) : 0;
    
    if (!title) {
      throw new Error('Não foi possível extrair dados do produto');
    }
    
    const productData: MLProductData = {
      title,
      price,
      images: image ? [image] : [],
      description: description || title,
      seller: 'Mercado Livre',
      freeShipping: html.toLowerCase().includes('frete grátis'),
      productId: extractProductId(url) || 'unknown'
    };
    
    return {
      success: true,
      data: productData
    };
    
  } catch (error: any) {
    console.error('[ML Scraping] Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro ao extrair dados da página'
    };
  }
}

/**
 * Normaliza e faz cache de imagem
 * Em produção, isso seria feito via CDN/Storage
 */
async function normalizeImage(imageUrl: string): Promise<string> {
  if (!IMAGE_CACHE_ENABLED) return imageUrl;
  
  try {
    // Substitui por versão de alta qualidade do ML
    const normalizedUrl = imageUrl
      .replace('-I.jpg', '-O.jpg')  // Original quality
      .replace('http://', 'https://');
    
    return normalizedUrl;
  } catch {
    return imageUrl;
  }
}

/**
 * FUNÇÃO PRINCIPAL: Extrai dados de um link do Mercado Livre
 */
export async function extractMLProductData(url: string): Promise<MLExtractionResult> {
  // Validação
  if (!url || !isValidMLUrl(url)) {
    return {
      success: false,
      error: 'URL inválida. Forneça um link válido do Mercado Livre.'
    };
  }
  
  // Verifica cache
  const cached = await checkCache(url);
  if (cached) {
    console.log('[ML] Usando dados do cache');
    return cached;
  }
  
  // Extrai ID do produto
  const productId = extractProductId(url);
  
  let result: MLExtractionResult;
  
  // Tenta API primeiro
  if (productId) {
    result = await extractFromAPI(productId);
  } else {
    result = { success: false, error: 'ID do produto não encontrado na URL' };
  }
  
  // Fallback para meta tags se API falhar
  if (!result.success) {
    console.log('[ML] API falhou, tentando fallback...');
    result = await extractFromMetaTags(url);
  }
  
  // Normaliza imagens se sucesso
  if (result.success && result.data) {
    result.data.images = await Promise.all(
      result.data.images.map(img => normalizeImage(img))
    );
  }
  
  // Salva no cache
  await saveToCache(url, result);
  
  return result;
}

/**
 * Converte dados extraídos para formato de AffiliateProduct
 */
export function convertToAffiliateProduct(
  extractedData: MLProductData,
  affiliateUrl: string,
  originalUrl: string
): Partial<AffiliateProduct> {
  const now = Date.now();
  
  return {
    type: ProductType.AFFILIATE,
    sku: `AFF-${extractedData.productId || Date.now()}`,
    name: extractedData.title,
    description: extractedData.description,
    technicalSpecs: Object.entries(extractedData.attributes || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
    category: detectCategory(extractedData.title),
    images: extractedData.images.map((url, index) => ({
      id: `img-${index}`,
      url,
      alt: extractedData.title,
      isPrimary: index === 0,
      order: index
    })),
    tags: ['afiliado', 'mercado-livre'],
    status: ProductStatus.ACTIVE,
    affiliateUrl,
    originalUrl,
    referencePrice: extractedData.price,
    seller: extractedData.seller,
    rating: extractedData.rating,
    reviewCount: extractedData.reviewCount,
    freeShipping: extractedData.freeShipping,
    externalId: extractedData.productId,
    lastSyncAt: now,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Detecta categoria baseado no título do produto
 */
function detectCategory(title: string): ProductCategory {
  const titleLower = title.toLowerCase();
  
  const categoryKeywords: Record<ProductCategory, string[]> = {
    [ProductCategory.NOTEBOOKS]: ['notebook', 'laptop', 'macbook', 'chromebook'],
    [ProductCategory.DESKTOPS]: ['desktop', 'pc gamer', 'computador', 'all in one'],
    [ProductCategory.SMARTPHONES]: ['celular', 'smartphone', 'iphone', 'galaxy', 'redmi'],
    [ProductCategory.TABLETS]: ['tablet', 'ipad'],
    [ProductCategory.ACESSORIOS]: ['case', 'capa', 'película', 'carregador', 'cabo', 'fone'],
    [ProductCategory.PERIFERICOS]: ['mouse', 'teclado', 'monitor', 'webcam', 'headset'],
    [ProductCategory.REDES]: ['roteador', 'switch', 'access point', 'wi-fi', 'modem'],
    [ProductCategory.ARMAZENAMENTO]: ['ssd', 'hd', 'pendrive', 'memoria', 'ram'],
    [ProductCategory.COMPONENTES]: ['placa', 'processador', 'cpu', 'gpu', 'fonte'],
    [ProductCategory.SOFTWARE]: ['windows', 'office', 'antivirus', 'licença'],
    [ProductCategory.SERVICOS]: ['instalação', 'configuração', 'suporte'],
    [ProductCategory.OUTROS]: []
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => titleLower.includes(kw))) {
      return category as ProductCategory;
    }
  }
  
  return ProductCategory.OUTROS;
}

/**
 * Sincroniza produto afiliado com dados atualizados do ML
 */
export async function syncAffiliateProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Busca produto no banco
    const { data: product, error: fetchError } = await supabase
      .from('affiliate_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError || !product) {
      return { success: false, error: 'Produto não encontrado' };
    }
    
    // Extrai dados atualizados
    const result = await extractMLProductData(product.original_url);
    
    if (!result.success || !result.data) {
      // Atualiza com erro
      await supabase
        .from('affiliate_products')
        .update({
          sync_error: result.error,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', productId);
      
      return { success: false, error: result.error };
    }
    
    // Atualiza produto
    const { error: updateError } = await supabase
      .from('affiliate_products')
      .update({
        name: result.data.title,
        description: result.data.description,
        reference_price: result.data.price,
        images: result.data.images.map((url, i) => ({
          id: `img-${i}`,
          url,
          alt: result.data.title,
          isPrimary: i === 0,
          order: i
        })),
        rating: result.data.rating,
        review_count: result.data.reviewCount,
        free_shipping: result.data.freeShipping,
        last_sync_at: new Date().toISOString(),
        sync_error: null
      })
      .eq('id', productId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const mercadoLivreService = {
  isValidMLUrl,
  extractProductId,
  extractMLProductData,
  convertToAffiliateProduct,
  syncAffiliateProduct,
  checkCache,
  detectCategory
};
