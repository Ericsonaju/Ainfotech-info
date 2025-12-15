/**
 * AINFOTECH E-COMMERCE - Card de Produto
 * Exibe produto próprio ou afiliado com ações contextuais
 */

import React from 'react';
import {
  ShoppingCart,
  ExternalLink,
  Tag,
  Package,
  Star,
  Truck,
  AlertCircle,
  Edit,
  Sparkles
} from 'lucide-react';
import { Product, ProductType, OwnProduct, AffiliateProduct, ProductStatus } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onGenerateAd?: (product: Product) => void;
  isAdmin?: boolean;
  showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onEdit,
  onGenerateAd,
  isAdmin = false,
  showActions = true
}) => {
  const isOwn = product.type === ProductType.OWN;
  const ownProduct = product as OwnProduct;
  const affiliateProduct = product as AffiliateProduct;
  
  const price = isOwn ? ownProduct.finalPrice : affiliateProduct.referencePrice;
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  
  const isOutOfStock = isOwn && ownProduct.stockQuantity === 0;
  const isLowStock = isOwn && ownProduct.stockQuantity > 0 && ownProduct.stockQuantity <= ownProduct.minStockAlert;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && isOwn && !isOutOfStock) {
      onAddToCart(product.id);
    }
  };
  
  const handleAffiliateClick = () => {
    if (!isOwn && affiliateProduct.affiliateUrl) {
      window.open(affiliateProduct.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div className={`group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10 ${product.status !== ProductStatus.ACTIVE ? 'opacity-60' : ''}`}>
      
      {/* Badge de Tipo */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isOwn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
          {isOwn ? 'Produto Próprio' : 'Afiliado ML'}
        </span>
      </div>
      
      {/* Badges de Status */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {isOutOfStock && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <AlertCircle size={10} /> Esgotado
          </span>
        )}
        {isLowStock && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Últimas {ownProduct.stockQuantity} un.
          </span>
        )}
        {!isOwn && affiliateProduct.freeShipping && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
            <Truck size={10} /> Frete Grátis
          </span>
        )}
      </div>
      
      {/* Imagem */}
      <div className="aspect-square bg-slate-900/50 relative overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Package size={48} />
          </div>
        )}
        
        {/* Overlay de ações rápidas */}
        {showActions && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
            {isOwn ? (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? 'Indisponível' : 'Adicionar'}
              </button>
            ) : (
              <button
                onClick={handleAffiliateClick}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                <ExternalLink size={18} />
                Ver no ML
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Categoria */}
        <div className="flex items-center gap-2">
          <Tag size={12} className="text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        
        {/* Nome */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        
        {/* Rating (afiliado) */}
        {!isOwn && affiliateProduct.rating && (
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-slate-400">
              {affiliateProduct.rating} ({affiliateProduct.reviewCount || 0} avaliações)
            </span>
          </div>
        )}
        
        {/* Preço */}
        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            {isOwn && (
              <span className="text-xs text-slate-500">
                {ownProduct.stockQuantity} em estoque
              </span>
            )}
          </div>
          
          {/* Disclaimer afiliado */}
          {!isOwn && (
            <p className="text-[10px] text-slate-500 mt-1 italic">
              Preço de referência no Mercado Livre
            </p>
          )}
        </div>
        
        {/* Ações Admin */}
        {isAdmin && (
          <div className="pt-3 border-t border-slate-700/50 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                <Edit size={14} />
                Editar
              </button>
            )}
            {onGenerateAd && (
              <button
                onClick={() => onGenerateAd(product)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Sparkles size={14} />
                Gerar Anúncio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
