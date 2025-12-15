/**
 * AINFOTECH E-COMMERCE - Importador de Produtos Afiliados
 * Extrai automaticamente dados do Mercado Livre
 */

import React, { useState } from 'react';
import {
  Link,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Edit2,
  Save,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { mercadoLivreService } from '../services/mercadoLivreService';
import { productService } from '../services/productService';
import { MLProductData, AffiliateProduct, ProductCategory, ProductStatus } from '../types';

interface AffiliateImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: AffiliateProduct) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type ImportStep = 'input' | 'extracting' | 'preview' | 'editing' | 'saving';

const AffiliateImporter: React.FC<AffiliateImporterProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [step, setStep] = useState<ImportStep>('input');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [extractedData, setExtractedData] = useState<MLProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Campos editáveis
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState<ProductCategory>(ProductCategory.OUTROS);
  const [editedTags, setEditedTags] = useState('');
  
  const resetState = () => {
    setStep('input');
    setAffiliateUrl('');
    setOriginalUrl('');
    setExtractedData(null);
    setError(null);
    setEditedName('');
    setEditedDescription('');
    setEditedCategory(ProductCategory.OUTROS);
    setEditedTags('');
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleExtract = async () => {
    if (!affiliateUrl.trim()) {
      setError('Por favor, insira o link do produto.');
      return;
    }
    
    // Valida URL
    if (!mercadoLivreService.isValidMLUrl(affiliateUrl)) {
      setError('Link inválido. Insira um link válido do Mercado Livre.');
      return;
    }
    
    setError(null);
    setStep('extracting');
    setOriginalUrl(affiliateUrl);
    
    try {
      const result = await mercadoLivreService.extractMLProductData(affiliateUrl);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Não foi possível extrair dados do produto.');
      }
      
      setExtractedData(result.data);
      
      // Preenche campos editáveis
      setEditedName(result.data.title);
      setEditedDescription(result.data.description);
      setEditedCategory(mercadoLivreService.detectCategory(result.data.title));
      setEditedTags(result.data.categoryPath?.join(', ') || '');
      
      setStep('preview');
      showToast('Sucesso', 'Dados extraídos automaticamente!', 'success');
      
    } catch (err: any) {
      setError(err.message || 'Erro ao extrair dados.');
      setStep('input');
      showToast('Erro', err.message, 'error');
    }
  };
  
  const handleSave = async () => {
    if (!extractedData) return;
    
    setStep('saving');
    
    try {
      const productData = mercadoLivreService.convertToAffiliateProduct(
        extractedData,
        affiliateUrl,
        originalUrl
      );
      
      // Aplica edições
      productData.name = editedName;
      productData.description = editedDescription;
      productData.category = editedCategory;
      productData.tags = editedTags.split(',').map(t => t.trim()).filter(Boolean);
      
      const result = await productService.createAffiliateProduct(productData as any);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar produto.');
      }
      
      showToast('Produto Salvo', 'Produto afiliado adicionado com sucesso!', 'success');
      onSuccess(result.data!);
      handleClose();
      
    } catch (err: any) {
      setError(err.message);
      setStep('preview');
      showToast('Erro', err.message, 'error');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-purple-900/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Link className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Importar do Mercado Livre</h2>
              <p className="text-xs text-slate-400">Cole o link de afiliado para extração automática</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Link do Produto (Mercado Livre)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="https://www.mercadolivre.com.br/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <ExternalLink className="absolute left-4 top-4 text-slate-500" size={20} />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Como funciona:</h4>
                <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Cole o link do produto do Mercado Livre</li>
                  <li>O sistema extrai automaticamente: título, imagens, preço e descrição</li>
                  <li>Revise e edite as informações se necessário</li>
                  <li>Salve o produto para exibição na sua loja</li>
                </ol>
              </div>
              
              <button
                onClick={handleExtract}
                disabled={!affiliateUrl.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Extrair Dados Automaticamente
              </button>
            </div>
          )}
          
          {/* Step: Extracting */}
          {step === 'extracting' && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-white mb-2">Extraindo dados...</h3>
              <p className="text-sm text-slate-400">
                Buscando informações do produto no Mercado Livre
              </p>
            </div>
          )}
          
          {/* Step: Preview */}
          {(step === 'preview' || step === 'editing') && extractedData && (
            <div className="space-y-6">
              
              {/* Preview do Produto */}
              <div className="flex gap-4">
                {/* Imagem */}
                <div className="w-32 h-32 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                  {extractedData.images[0] ? (
                    <img
                      src={extractedData.images[0]}
                      alt={extractedData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={16} />
                    <span className="text-xs text-green-400 font-medium">Dados extraídos com sucesso</span>
                  </div>
                  
                  <h3 className="text-white font-medium line-clamp-2">
                    {extractedData.title}
                  </h3>
                  
                  <div className="text-xl font-bold text-green-400">
                    R$ {extractedData.price.toFixed(2).replace('.', ',')}
                  </div>
                  
                  {extractedData.freeShipping && (
                    <span className="inline-block text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Frete Grátis
                    </span>
                  )}
                </div>
              </div>
              
              {/* Imagens extras */}
              {extractedData.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {extractedData.images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Imagem ${idx + 2}`}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                    />
                  ))}
                  {extractedData.images.length > 5 && (
                    <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      +{extractedData.images.length - 5}
                    </div>
                  )}
                </div>
              )}
              
              {/* Campos Editáveis */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Informações do Produto</h4>
                  <button
                    onClick={() => setStep(step === 'editing' ? 'preview' : 'editing')}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    {step === 'editing' ? 'Concluir Edição' : 'Editar'}
                  </button>
                </div>
                
                {/* Nome */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nome do Produto</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={step !== 'editing'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white disabled:opacity-60 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                {/* Descrição */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Descrição</label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    disabled={step !== 'editing'}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white disabled:opacity-60 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                
                {/* Categoria */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Categoria</label>
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value as ProductCategory)}
                    disabled={step !== 'editing'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white disabled:opacity-60 focus:outline-none focus:border-purple-500"
                  >
                    {Object.values(ProductCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={editedTags}
                    onChange={(e) => setEditedTags(e.target.value)}
                    disabled={step !== 'editing'}
                    placeholder="notebook, dell, gamer"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white disabled:opacity-60 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              
              {/* Aviso Legal */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-xs text-purple-300">
                  <strong>⚠️ Importante:</strong> Este produto será cadastrado como <strong>AFILIADO</strong>. 
                  Clientes serão redirecionados ao Mercado Livre para compra. 
                  Você receberá comissão conforme seu acordo de afiliação.
                </p>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              {/* Ações */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetState}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSave}
                  disabled={step === 'saving'}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {step === 'saving' ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Salvar Produto
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Step: Saving */}
          {step === 'saving' && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-white mb-2">Salvando produto...</h3>
              <p className="text-sm text-slate-400">
                Processando imagens e criando cadastro
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default AffiliateImporter;
