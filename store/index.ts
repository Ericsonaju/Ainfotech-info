/**
 * AINFOTECH E-COMMERCE - Módulo Principal
 * Exporta todos os componentes, serviços e tipos da loja
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 */

// ============================================
// TIPOS
// ============================================
export * from './types';

// ============================================
// SERVIÇOS
// ============================================
export { productService, calculateFinalPrice, generateSKU } from './services/productService';
export { cartService } from './services/cartService';
export { orderService, LEGAL_TEXTS } from './services/orderService';
export { mercadoLivreService } from './services/mercadoLivreService';
export { adGeneratorService } from './services/adGeneratorService';

// ============================================
// COMPONENTES
// ============================================
export { default as ProductCard } from './components/ProductCard';
export { default as AffiliateImporter } from './components/AffiliateImporter';
export { default as CheckoutFlow } from './components/CheckoutFlow';
export { default as StorePage } from './components/StorePage';
