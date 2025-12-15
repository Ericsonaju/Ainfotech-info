/**
 * AINFOTECH E-COMMERCE - Serviço de Carrinho
 * Sistema de carrinho com persistência em localStorage
 * APENAS produtos próprios (Domínio A)
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 */

import { Cart, CartItem, OwnProduct } from '../types';
import { productService } from './productService';

const CART_STORAGE_KEY = 'ainfotech_cart';

// ============================================
// FUNÇÕES DE PERSISTÊNCIA
// ============================================

/**
 * Carrega carrinho do localStorage
 */
function loadCartFromStorage(): Cart {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const cart = JSON.parse(stored) as Cart;
      return cart;
    }
  } catch (e) {
    console.error('[Cart] Erro ao carregar carrinho:', e);
  }
  
  return createEmptyCart();
}

/**
 * Salva carrinho no localStorage
 */
function saveCartToStorage(cart: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('[Cart] Erro ao salvar carrinho:', e);
  }
}

/**
 * Cria carrinho vazio
 */
function createEmptyCart(): Cart {
  return {
    id: `cart-${Date.now()}`,
    items: [],
    subtotal: 0,
    discount: 0,
    shippingCost: 0,
    total: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Recalcula totais do carrinho
 */
function recalculateTotals(cart: Cart): Cart {
  const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal - cart.discount + cart.shippingCost;
  
  return {
    ...cart,
    subtotal,
    total: Math.max(0, total),
    updatedAt: Date.now()
  };
}

// ============================================
// OPERAÇÕES DO CARRINHO
// ============================================

/**
 * Obtém o carrinho atual
 */
export function getCart(): Cart {
  return loadCartFromStorage();
}

/**
 * Adiciona item ao carrinho
 * @throws Error se produto não disponível ou sem estoque
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; cart: Cart; message?: string }> {
  try {
    // Busca produto
    const product = await productService.fetchOwnProductById(productId);
    if (!product) {
      return {
        success: false,
        cart: getCart(),
        message: 'Produto não encontrado.'
      };
    }
    
    // Verifica estoque
    const cart = loadCartFromStorage();
    const existingItem = cart.items.find(item => item.productId === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentQuantity + quantity;
    
    const stockCheck = await productService.checkStockAvailability(productId, totalQuantity);
    if (!stockCheck.available) {
      return {
        success: false,
        cart,
        message: stockCheck.message || 'Estoque insuficiente.'
      };
    }
    
    // Atualiza ou adiciona item
    if (existingItem) {
      existingItem.quantity = totalQuantity;
      existingItem.totalPrice = existingItem.unitPrice * totalQuantity;
    } else {
      const newItem: CartItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        unitPrice: product.finalPrice,
        totalPrice: product.finalPrice * quantity,
        addedAt: Date.now()
      };
      cart.items.push(newItem);
    }
    
    const updatedCart = recalculateTotals(cart);
    saveCartToStorage(updatedCart);
    
    return {
      success: true,
      cart: updatedCart,
      message: 'Produto adicionado ao carrinho!'
    };
    
  } catch (error: any) {
    return {
      success: false,
      cart: getCart(),
      message: error.message || 'Erro ao adicionar produto.'
    };
  }
}

/**
 * Remove item do carrinho
 */
export function removeFromCart(itemId: string): Cart {
  const cart = loadCartFromStorage();
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  const updatedCart = recalculateTotals(cart);
  saveCartToStorage(updatedCart);
  
  return updatedCart;
}

/**
 * Atualiza quantidade de item no carrinho
 */
export async function updateItemQuantity(
  itemId: string,
  newQuantity: number
): Promise<{ success: boolean; cart: Cart; message?: string }> {
  if (newQuantity <= 0) {
    return {
      success: true,
      cart: removeFromCart(itemId),
      message: 'Item removido do carrinho.'
    };
  }
  
  const cart = loadCartFromStorage();
  const item = cart.items.find(i => i.id === itemId);
  
  if (!item) {
    return {
      success: false,
      cart,
      message: 'Item não encontrado no carrinho.'
    };
  }
  
  // Verifica estoque
  const stockCheck = await productService.checkStockAvailability(item.productId, newQuantity);
  if (!stockCheck.available) {
    return {
      success: false,
      cart,
      message: stockCheck.message || 'Estoque insuficiente.'
    };
  }
  
  // Atualiza quantidade
  item.quantity = newQuantity;
  item.totalPrice = item.unitPrice * newQuantity;
  
  const updatedCart = recalculateTotals(cart);
  saveCartToStorage(updatedCart);
  
  return {
    success: true,
    cart: updatedCart,
    message: 'Quantidade atualizada!'
  };
}

/**
 * Aplica desconto ao carrinho
 */
export function applyDiscount(discountAmount: number): Cart {
  const cart = loadCartFromStorage();
  cart.discount = Math.max(0, discountAmount);
  
  const updatedCart = recalculateTotals(cart);
  saveCartToStorage(updatedCart);
  
  return updatedCart;
}

/**
 * Define custo de frete
 */
export function setShippingCost(cost: number): Cart {
  const cart = loadCartFromStorage();
  cart.shippingCost = Math.max(0, cost);
  
  const updatedCart = recalculateTotals(cart);
  saveCartToStorage(updatedCart);
  
  return updatedCart;
}

/**
 * Limpa o carrinho
 */
export function clearCart(): Cart {
  const emptyCart = createEmptyCart();
  saveCartToStorage(emptyCart);
  return emptyCart;
}

/**
 * Valida todos os itens do carrinho (estoque e preços)
 * Retorna itens inválidos para remoção
 */
export async function validateCart(): Promise<{
  valid: boolean;
  cart: Cart;
  invalidItems: { itemId: string; reason: string }[];
  priceChanges: { itemId: string; oldPrice: number; newPrice: number }[];
}> {
  const cart = loadCartFromStorage();
  const invalidItems: { itemId: string; reason: string }[] = [];
  const priceChanges: { itemId: string; oldPrice: number; newPrice: number }[] = [];
  
  for (const item of cart.items) {
    const product = await productService.fetchOwnProductById(item.productId);
    
    if (!product) {
      invalidItems.push({
        itemId: item.id,
        reason: 'Produto não encontrado.'
      });
      continue;
    }
    
    // Verifica estoque
    const stockCheck = await productService.checkStockAvailability(item.productId, item.quantity);
    if (!stockCheck.available) {
      invalidItems.push({
        itemId: item.id,
        reason: stockCheck.message || 'Estoque insuficiente.'
      });
      continue;
    }
    
    // Verifica mudança de preço
    if (item.unitPrice !== product.finalPrice) {
      priceChanges.push({
        itemId: item.id,
        oldPrice: item.unitPrice,
        newPrice: product.finalPrice
      });
      
      // Atualiza preço automaticamente
      item.unitPrice = product.finalPrice;
      item.totalPrice = product.finalPrice * item.quantity;
      item.product = product;
    }
  }
  
  // Remove itens inválidos
  if (invalidItems.length > 0) {
    cart.items = cart.items.filter(
      item => !invalidItems.some(inv => inv.itemId === item.id)
    );
  }
  
  const updatedCart = recalculateTotals(cart);
  saveCartToStorage(updatedCart);
  
  return {
    valid: invalidItems.length === 0,
    cart: updatedCart,
    invalidItems,
    priceChanges
  };
}

/**
 * Conta itens no carrinho
 */
export function getCartItemCount(): number {
  const cart = loadCartFromStorage();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Verifica se produto está no carrinho
 */
export function isProductInCart(productId: string): boolean {
  const cart = loadCartFromStorage();
  return cart.items.some(item => item.productId === productId);
}

/**
 * Obtém quantidade de um produto no carrinho
 */
export function getProductQuantityInCart(productId: string): number {
  const cart = loadCartFromStorage();
  const item = cart.items.find(i => i.productId === productId);
  return item ? item.quantity : 0;
}

// ============================================
// EXPORT
// ============================================

export const cartService = {
  getCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  applyDiscount,
  setShippingCost,
  clearCart,
  validateCart,
  getCartItemCount,
  isProductInCart,
  getProductQuantityInCart
};
