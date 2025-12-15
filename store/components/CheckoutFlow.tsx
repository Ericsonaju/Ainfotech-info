/**
 * AINFOTECH E-COMMERCE - Fluxo de Checkout
 * Checkout completo com conformidade CDC/LGPD
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  User,
  FileText,
  Scale,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Shield,
  X
} from 'lucide-react';
import { 
  CheckoutState, 
  CustomerInfo, 
  PaymentMethod, 
  ConsentType,
  Order
} from '../types';
import { orderService, LEGAL_TEXTS } from '../services/orderService';
import { cartService } from '../services/cartService';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (order: Order) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const STEPS = [
  { id: 'cart', icon: ShoppingCart, label: 'Carrinho' },
  { id: 'customer', icon: User, label: 'Seus Dados' },
  { id: 'review', icon: FileText, label: 'Revisão' },
  { id: 'legal', icon: Scale, label: 'Termos' },
  { id: 'payment', icon: CreditCard, label: 'Pagamento' },
  { id: 'confirmation', icon: CheckCircle2, label: 'Confirmação' }
];

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  showToast
}) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  
  // Form states
  const [customerForm, setCustomerForm] = useState<Partial<CustomerInfo>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Initialize checkout
  useEffect(() => {
    if (isOpen) {
      const cart = cartService.getCart();
      if (cart.items.length === 0) {
        showToast('Carrinho Vazio', 'Adicione produtos antes de finalizar.', 'warning');
        onClose();
        return;
      }
      
      const existingState = orderService.loadCheckoutState();
      if (existingState && existingState.cart.items.length > 0) {
        setCheckoutState(existingState);
      } else {
        const newState = orderService.createCheckoutState(cart);
        orderService.saveCheckoutState(newState);
        setCheckoutState(newState);
      }
    }
  }, [isOpen]);
  
  const handleClose = () => {
    // Salva estado para retomar depois
    if (checkoutState) {
      orderService.saveCheckoutState(checkoutState);
    }
    onClose();
  };
  
  const currentStepIndex = checkoutState?.currentStep || 0;
  const currentStepId = STEPS[currentStepIndex]?.id || 'cart';
  
  // Validação do formulário de cliente
  const validateCustomerForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customerForm.name?.trim()) errors.name = 'Nome é obrigatório';
    if (!customerForm.email?.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) errors.email = 'E-mail inválido';
    if (!customerForm.phone?.trim()) errors.phone = 'Telefone é obrigatório';
    if (!customerForm.cpfCnpj?.trim()) errors.cpfCnpj = 'CPF/CNPJ é obrigatório';
    if (!customerForm.address?.street?.trim()) errors.street = 'Rua é obrigatória';
    if (!customerForm.address?.number?.trim()) errors.number = 'Número é obrigatório';
    if (!customerForm.address?.neighborhood?.trim()) errors.neighborhood = 'Bairro é obrigatório';
    if (!customerForm.address?.city?.trim()) errors.city = 'Cidade é obrigatória';
    if (!customerForm.address?.state?.trim()) errors.state = 'Estado é obrigatório';
    if (!customerForm.address?.zipCode?.trim()) errors.zipCode = 'CEP é obrigatório';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Avançar passo
  const handleNext = () => {
    if (!checkoutState) return;
    
    // Validações específicas por passo
    if (currentStepId === 'customer') {
      if (!validateCustomerForm()) {
        showToast('Dados Incompletos', 'Preencha todos os campos obrigatórios.', 'error');
        return;
      }
      
      const updatedState = orderService.setCustomerInfo(checkoutState, customerForm as CustomerInfo);
      setCheckoutState(updatedState);
    }
    
    if (currentStepId === 'legal') {
      const consentCheck = orderService.checkRequiredConsents(checkoutState);
      if (!consentCheck.valid) {
        showToast('Termos Pendentes', 'Aceite todos os termos obrigatórios para continuar.', 'error');
        return;
      }
    }
    
    if (currentStepId === 'payment' && !checkoutState.paymentMethod) {
      showToast('Pagamento', 'Selecione um método de pagamento.', 'error');
      return;
    }
    
    const newState = orderService.advanceCheckoutStep(checkoutState);
    setCheckoutState(newState);
    
    // Se chegou no último passo, finaliza
    if (currentStepIndex === STEPS.length - 2) {
      handleFinalize();
    }
  };
  
  // Voltar passo
  const handleBack = () => {
    if (!checkoutState || currentStepIndex === 0) return;
    const newState = orderService.goBackCheckoutStep(checkoutState);
    setCheckoutState(newState);
  };
  
  // Registrar consentimento
  const handleConsent = (type: ConsentType, accepted: boolean) => {
    if (!checkoutState) return;
    const newState = orderService.recordConsent(checkoutState, type, accepted);
    setCheckoutState(newState);
  };
  
  // Selecionar pagamento
  const handlePaymentSelect = (method: PaymentMethod) => {
    if (!checkoutState) return;
    const newState = orderService.setPaymentMethod(checkoutState, method);
    setCheckoutState(newState);
  };
  
  // Finalizar pedido
  const handleFinalize = async () => {
    if (!checkoutState) return;
    
    setIsLoading(true);
    
    try {
      const result = await orderService.createOrder(checkoutState);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erro ao criar pedido.');
      }
      
      setCompletedOrder(result.data);
      showToast('Pedido Criado!', `Número: ${result.data.orderNumber}`, 'success');
      onComplete(result.data);
      
    } catch (error: any) {
      showToast('Erro', error.message, 'error');
      // Volta um passo
      if (checkoutState) {
        const newState = orderService.goBackCheckoutStep(checkoutState);
        setCheckoutState(newState);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Shield className="text-green-500" size={24} />
            Checkout Seguro
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-700 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex flex-col items-center gap-2 ${isCurrent ? 'scale-110' : ''} transition-transform`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isCurrent ? 'bg-blue-600 text-white' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={`text-xs font-medium ${
                      isCurrent ? 'text-white' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Loading */}
          {isLoading && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-white">Processando seu pedido...</h3>
              <p className="text-sm text-slate-400 mt-2">Aguarde enquanto finalizamos</p>
            </div>
          )}
          
          {/* Step: Cart Review */}
          {!isLoading && currentStepId === 'cart' && checkoutState && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Revise seu Carrinho</h3>
              
              <div className="space-y-3">
                {checkoutState.cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{item.product.name}</h4>
                      <p className="text-xs text-slate-400">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs text-slate-500">R$ {item.unitPrice.toFixed(2).replace('.', ',')} un.</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">R$ {checkoutState.cart.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {checkoutState.cart.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Desconto</span>
                    <span className="text-green-400">-R$ {checkoutState.cart.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">R$ {checkoutState.cart.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step: Customer Info */}
          {!isLoading && currentStepId === 'customer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Seus Dados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Nome Completo *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerForm.name || ''}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full bg-slate-800 border rounded-lg p-3 pl-10 text-white focus:outline-none ${
                        formErrors.name ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    <User className="absolute left-3 top-3 text-slate-500" size={18} />
                  </div>
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                {/* E-mail */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">E-mail *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customerForm.email || ''}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full bg-slate-800 border rounded-lg p-3 pl-10 text-white focus:outline-none ${
                        formErrors.email ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                  </div>
                  {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                </div>
                
                {/* Telefone */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Telefone *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerForm.phone || ''}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(79) 99999-9999"
                      className={`w-full bg-slate-800 border rounded-lg p-3 pl-10 text-white focus:outline-none ${
                        formErrors.phone ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                  </div>
                  {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                
                {/* CPF/CNPJ */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    value={customerForm.cpfCnpj || ''}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, cpfCnpj: e.target.value }))}
                    placeholder="000.000.000-00"
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.cpfCnpj ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.cpfCnpj && <p className="text-red-400 text-xs mt-1">{formErrors.cpfCnpj}</p>}
                </div>
                
                {/* CEP */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CEP *</label>
                  <input
                    type="text"
                    value={customerForm.address?.zipCode || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, zipCode: e.target.value } as CustomerInfo['address']
                    }))}
                    placeholder="49000-000"
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.zipCode ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.zipCode && <p className="text-red-400 text-xs mt-1">{formErrors.zipCode}</p>}
                </div>
                
                {/* Rua */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Rua *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerForm.address?.street || ''}
                      onChange={(e) => setCustomerForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value } as CustomerInfo['address']
                      }))}
                      className={`w-full bg-slate-800 border rounded-lg p-3 pl-10 text-white focus:outline-none ${
                        formErrors.street ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                  </div>
                  {formErrors.street && <p className="text-red-400 text-xs mt-1">{formErrors.street}</p>}
                </div>
                
                {/* Número */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Número *</label>
                  <input
                    type="text"
                    value={customerForm.address?.number || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, number: e.target.value } as CustomerInfo['address']
                    }))}
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.number ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.number && <p className="text-red-400 text-xs mt-1">{formErrors.number}</p>}
                </div>
                
                {/* Complemento */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Complemento</label>
                  <input
                    type="text"
                    value={customerForm.address?.complement || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, complement: e.target.value } as CustomerInfo['address']
                    }))}
                    placeholder="Apto, Bloco, etc."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {/* Bairro */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Bairro *</label>
                  <input
                    type="text"
                    value={customerForm.address?.neighborhood || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, neighborhood: e.target.value } as CustomerInfo['address']
                    }))}
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.neighborhood ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.neighborhood && <p className="text-red-400 text-xs mt-1">{formErrors.neighborhood}</p>}
                </div>
                
                {/* Cidade */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cidade *</label>
                  <input
                    type="text"
                    value={customerForm.address?.city || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value } as CustomerInfo['address']
                    }))}
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.city ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
                </div>
                
                {/* Estado */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Estado *</label>
                  <select
                    value={customerForm.address?.state || ''}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value } as CustomerInfo['address']
                    }))}
                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none ${
                      formErrors.state ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    <option value="SE">Sergipe</option>
                    <option value="BA">Bahia</option>
                    <option value="AL">Alagoas</option>
                    <option value="PE">Pernambuco</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    {/* Adicionar mais estados */}
                  </select>
                  {formErrors.state && <p className="text-red-400 text-xs mt-1">{formErrors.state}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Step: Review */}
          {!isLoading && currentStepId === 'review' && checkoutState && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Revise seu Pedido</h3>
              
              {/* Dados do Cliente */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Dados de Entrega</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Nome</p>
                    <p className="text-white">{checkoutState.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">E-mail</p>
                    <p className="text-white">{checkoutState.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Telefone</p>
                    <p className="text-white">{checkoutState.customer?.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">CPF/CNPJ</p>
                    <p className="text-white">{checkoutState.customer?.cpfCnpj}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Endereço</p>
                    <p className="text-white">
                      {checkoutState.customer?.address.street}, {checkoutState.customer?.address.number}
                      {checkoutState.customer?.address.complement && ` - ${checkoutState.customer.address.complement}`}
                      <br />
                      {checkoutState.customer?.address.neighborhood} - {checkoutState.customer?.address.city}/{checkoutState.customer?.address.state}
                      <br />
                      CEP: {checkoutState.customer?.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Resumo do Pedido */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Itens do Pedido</h4>
                <div className="space-y-2">
                  {checkoutState.cart.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-400">{item.quantity}x {item.product.name}</span>
                      <span className="text-white">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">R$ {checkoutState.cart.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step: Legal */}
          {!isLoading && currentStepId === 'legal' && checkoutState && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Termos e Condições</h3>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                  <p className="text-sm text-yellow-200">
                    <strong>Aviso Legal:</strong> Esta empresa está localizada em Aracaju-SE. 
                    Ao prosseguir com a compra, você declara ciência dos termos conforme o 
                    Código de Defesa do Consumidor (Lei 8.078/90) e a Lei Geral de Proteção de Dados (Lei 13.709/18).
                  </p>
                </div>
              </div>
              
              {/* Termos */}
              {[ConsentType.PURCHASE, ConsentType.DATA_PROCESSING, ConsentType.TERMS_OF_SERVICE].map(type => {
                const legalText = LEGAL_TEXTS[type];
                const consent = checkoutState.consents.find(c => c.type === type);
                const isAccepted = consent?.accepted || false;
                
                return (
                  <div key={type} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-white mb-2">{legalText.title}</h4>
                      <div className="max-h-32 overflow-y-auto text-xs text-slate-400 whitespace-pre-line bg-slate-900/50 p-3 rounded-lg">
                        {legalText.text}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800 border-t border-slate-700">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAccepted}
                          onChange={(e) => handleConsent(type, e.target.checked)}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-white">
                          Li e aceito os {legalText.title.toLowerCase()}
                        </span>
                        <span className="text-xs text-red-400 ml-auto">*Obrigatório</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Step: Payment */}
          {!isLoading && currentStepId === 'payment' && checkoutState && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Forma de Pagamento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { method: PaymentMethod.PIX, label: 'PIX', icon: '💎', desc: 'Pagamento instantâneo' },
                  { method: PaymentMethod.CREDIT_CARD, label: 'Cartão de Crédito', icon: '💳', desc: 'Até 12x' },
                  { method: PaymentMethod.DEBIT_CARD, label: 'Cartão de Débito', icon: '💳', desc: 'À vista' },
                  { method: PaymentMethod.CASH, label: 'Dinheiro', icon: '💵', desc: 'Na entrega' }
                ].map(({ method, label, icon, desc }) => (
                  <button
                    key={method}
                    onClick={() => handlePaymentSelect(method)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      checkoutState.paymentMethod === method
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </button>
                ))}
              </div>
              
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-300 font-medium">Total a Pagar</span>
                  <span className="text-2xl font-bold text-green-400">
                    R$ {checkoutState.cart.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step: Confirmation */}
          {!isLoading && currentStepId === 'confirmation' && completedOrder && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Pedido Realizado!</h3>
                <p className="text-slate-400">
                  Seu pedido foi registrado com sucesso
                </p>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 inline-block">
                <p className="text-sm text-slate-400 mb-1">Número do Pedido</p>
                <p className="text-3xl font-bold text-blue-400">{completedOrder.orderNumber}</p>
              </div>
              
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Enviamos um e-mail para <strong>{completedOrder.customer.email}</strong> com os detalhes do pedido.
                Em breve entraremos em contato para confirmar o pagamento.
              </p>
              
              <button
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                Voltar à Loja
              </button>
            </div>
          )}
          
        </div>
        
        {/* Footer with Navigation */}
        {!isLoading && currentStepId !== 'confirmation' && (
          <div className="p-6 border-t border-slate-700 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
            >
              {currentStepId === 'payment' ? 'Finalizar Pedido' : 'Continuar'}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CheckoutFlow;
