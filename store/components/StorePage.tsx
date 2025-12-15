/**
 * AINFOTECH E-COMMERCE - Página Principal da Loja
 * Integra produtos próprios e afiliados
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  Package,
  ExternalLink,
  Plus,
  Grid,
  List,
  ChevronDown,
  X,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  ArrowLeft,
  Store,
  BadgePercent
} from 'lucide-react';
import { 
  Product, 
  ProductType, 
  OwnProduct, 
  AffiliateProduct, 
  ProductCategory,
  ProductStatus,
  Order
} from '../types';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import ProductCard from './ProductCard';
import AffiliateImporter from './AffiliateImporter';
import CheckoutFlow from './CheckoutFlow';

interface StorePageProps {
  isAdmin?: boolean;
  onBack?: () => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type ViewMode = 'grid' | 'list';
type ProductFilter = 'all' | 'own' | 'affiliate';

const StorePage: React.FC<StorePageProps> = ({
  isAdmin = false,
  onBack,
  showToast
}) => {
  // States
  const [ownProducts, setOwnProducts] = useState<OwnProduct[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Modals
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Load products
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ownResult, affiliateResult] = await Promise.all([
        productService.fetchOwnProducts({ status: ProductStatus.ACTIVE }),
        productService.fetchAffiliateProducts({ status: ProductStatus.ACTIVE })
      ]);
      
      setOwnProducts(ownResult.data);
      setAffiliateProducts(affiliateResult.data);
    } catch (error: any) {
      showToast('Erro', 'Não foi possível carregar produtos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  
  // Update cart count
  useEffect(() => {
    setCartItemCount(cartService.getCartItemCount());
  }, [isCartOpen]);
  
  // Filter products
  const allProducts: Product[] = [
    ...ownProducts.map(p => ({ ...p, type: ProductType.OWN as const })),
    ...affiliateProducts.map(p => ({ ...p, type: ProductType.AFFILIATE as const }))
  ];
  
  const filteredProducts = allProducts.filter(product => {
    // Filtro por tipo
    if (productFilter === 'own' && product.type !== ProductType.OWN) return false;
    if (productFilter === 'affiliate' && product.type !== ProductType.AFFILIATE) return false;
    
    // Filtro por categoria
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    
    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search)
      );
    }
    
    return true;
  });
  
  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    const result = await cartService.addToCart(productId, 1);
    if (result.success) {
      showToast('Adicionado!', 'Produto adicionado ao carrinho.', 'success');
      setCartItemCount(cartService.getCartItemCount());
    } else {
      showToast('Erro', result.message || 'Não foi possível adicionar.', 'error');
    }
  };
  
  // Handle affiliate import success
  const handleAffiliateImported = (product: AffiliateProduct) => {
    setAffiliateProducts(prev => [product, ...prev]);
  };
  
  // Handle order complete
  const handleOrderComplete = (order: Order) => {
    setCartItemCount(0);
    loadProducts(); // Recarrega para atualizar estoque
  };
  
  // Cart Preview Component
  const CartPreview = () => {
    const cart = cartService.getCart();
    
    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-bold text-white">Carrinho</h3>
        </div>
        
        {cart.items.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="text-slate-400 text-sm">Carrinho vazio</p>
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto p-4 space-y-3">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-400">Qtd: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-white">
                    R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-700 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <span className="font-bold text-white">R$ {cart.total.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors"
              >
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo / Back */}
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-xl">
                  <Store className="text-blue-400" size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AINFOTECH</h1>
                  <p className="text-xs text-slate-400">Loja de Informática</p>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => setIsImporterOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl font-medium transition-colors border border-purple-500/30"
                >
                  <LinkIcon size={18} />
                  <span className="hidden lg:inline">Importar ML</span>
                </button>
              )}
              
              {/* Cart Button */}
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </button>
                
                {isCartOpen && <CartPreview />}
              </div>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            </div>
          </div>
        </div>
      </header>
      
      {/* Filters Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 md:pb-0">
            
            {/* Product Type Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setProductFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  productFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setProductFilter('own')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  productFilter === 'own'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Package size={16} />
                Próprios
              </button>
              <button
                onClick={() => setProductFilter('affiliate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  productFilter === 'affiliate'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ExternalLink size={16} />
                Afiliados
              </button>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas Categorias</option>
                {Object.values(ProductCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {/* View Mode */}
              <div className="hidden sm:flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Package className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{ownProducts.length}</p>
                <p className="text-xs text-slate-400">Produtos Próprios</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <ExternalLink className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{affiliateProducts.length}</p>
                <p className="text-xs text-slate-400">Afiliados ML</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <ShoppingCart className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{cartItemCount}</p>
                <p className="text-xs text-slate-400">No Carrinho</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <BadgePercent className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
                <p className="text-xs text-slate-400">Exibindo</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-500" size={40} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-white mb-2">Nenhum produto encontrado</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm 
                ? `Nenhum resultado para "${searchTerm}"`
                : 'Não há produtos cadastrados nesta categoria.'
              }
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsImporterOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdmin={isAdmin}
                showActions={true}
              />
            ))}
          </div>
        )}
        
        {/* Legal Notice */}
        <div className="mt-12 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center">
          <p className="text-xs text-slate-500">
            <strong>AINFOTECH Informática</strong> | Aracaju - Sergipe - Brasil
            <br />
            Produtos próprios vendidos diretamente. Produtos afiliados redirecionam ao Mercado Livre.
            <br />
            Garantia legal conforme CDC. Preços e disponibilidade sujeitos a alteração.
          </p>
        </div>
        
      </main>
      
      {/* Click outside to close cart */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* Modals */}
      <AffiliateImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={handleAffiliateImported}
        showToast={showToast}
      />
      
      <CheckoutFlow
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleOrderComplete}
        showToast={showToast}
      />
      
    </div>
  );
};

export default StorePage;
