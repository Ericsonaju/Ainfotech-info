/**
 * AINFOTECH E-COMMERCE - Serviço de Pedidos e Checkout
 * Fluxo completo com conformidade CDC/LGPD
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 * @legislation CDC, LGPD, Marco Civil da Internet
 */

import { supabase } from '../../services/supabase';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  CustomerInfo,
  LegalConsent,
  ConsentType,
  Cart,
  CheckoutState,
  CheckoutStep,
  ApiResponse
} from '../types';
import { cartService } from './cartService';
import { productService } from './productService';

// ============================================
// CONSTANTES LEGAIS
// ============================================

export const LEGAL_TEXTS = {
  [ConsentType.PURCHASE]: {
    version: '1.0',
    title: 'Termos de Compra',
    text: `Ao confirmar esta compra, declaro estar ciente de que:

1. Esta empresa, AINFOTECH, está localizada em Aracaju-SE, Brasil.

2. Conforme o Art. 49 do CDC, tenho direito de arrependimento em até 7 dias corridos após o recebimento do produto para compras realizadas fora do estabelecimento comercial.

3. Os produtos estão sujeitos à garantia legal de 90 dias, conforme Art. 26 do CDC.

4. Ao prosseguir, concordo com os termos e condições de venda.`
  },
  
  [ConsentType.WARRANTY]: {
    version: '1.0',
    title: 'Termos de Garantia',
    text: `POLÍTICA DE GARANTIA - AINFOTECH

1. GARANTIA LEGAL (CDC Art. 26): 90 dias para produtos e serviços.

2. EXCLUSÕES: A garantia não cobre:
   - Danos por mau uso ou uso indevido
   - Quedas, líquidos, variações de tensão
   - Modificações não autorizadas
   - Desgaste natural

3. PROCEDIMENTO: Para acionar a garantia, apresente a nota fiscal e entre em contato.

4. PRAZO: O reparo será realizado em até 30 dias, conforme Art. 18 do CDC.`
  },
  
  [ConsentType.DATA_PROCESSING]: {
    version: '1.0',
    title: 'Tratamento de Dados (LGPD)',
    text: `CONSENTIMENTO PARA TRATAMENTO DE DADOS - LGPD

Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018):

1. DADOS COLETADOS: Nome, CPF/CNPJ, e-mail, telefone e endereço.

2. FINALIDADE: Processamento do pedido, entrega, emissão de nota fiscal e comunicações sobre a compra.

3. COMPARTILHAMENTO: Dados podem ser compartilhados com transportadoras e processadores de pagamento, exclusivamente para conclusão da transação.

4. ARMAZENAMENTO: Os dados serão mantidos pelo prazo legal exigido para fins fiscais e garantia.

5. DIREITOS: Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.

6. CONTATO DPO: infomedaju@gmail.com`
  },
  
  [ConsentType.TERMS_OF_SERVICE]: {
    version: '1.0',
    title: 'Termos de Serviço',
    text: `TERMOS DE SERVIÇO - AINFOTECH

1. OBJETO: Venda de produtos de informática e prestação de serviços técnicos.

2. PREÇOS: Sujeitos a alteração sem aviso prévio. O preço válido é o apresentado no momento da compra.

3. ENTREGA: Prazos estimados podem variar conforme localidade e disponibilidade.

4. PAGAMENTO: Aceitamos PIX, cartões e dinheiro. Pagamentos via cartão estão sujeitos à análise.

5. CANCELAMENTO: Pedidos podem ser cancelados antes do envio, sujeitos a estorno conforme método de pagamento.

6. FORO: Fica eleito o foro da Comarca de Aracaju-SE para dirimir quaisquer questões.`
  },
  
  [ConsentType.PRIVACY_POLICY]: {
    version: '1.0',
    title: 'Política de Privacidade',
    text: `POLÍTICA DE PRIVACIDADE - AINFOTECH

Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.

1. COLETA: Coletamos apenas dados necessários para processar seu pedido.

2. COOKIES: Utilizamos cookies para melhorar sua experiência de navegação.

3. SEGURANÇA: Seus dados são protegidos com criptografia e acesso restrito.

4. RETENÇÃO: Mantemos seus dados pelo prazo legal necessário.

5. TERCEIROS: Não vendemos seus dados. Compartilhamos apenas com parceiros essenciais.

6. ATUALIZAÇÕES: Esta política pode ser atualizada. A versão vigente estará sempre disponível no site.

Última atualização: ${new Date().toLocaleDateString('pt-BR')}`
  }
};

// ============================================
// MAPEAMENTO DB <-> APP
// ============================================

function mapOrderFromDB(dbOrder: any, items?: any[]): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customer: dbOrder.customer_snapshot,
    items: (items || []).map(i => ({
      id: i.id,
      productId: i.product_id,
      productSku: i.product_sku,
      productName: i.product_name,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price)
    })),
    subtotal: Number(dbOrder.subtotal),
    discount: Number(dbOrder.discount) || 0,
    shippingCost: Number(dbOrder.shipping_cost) || 0,
    total: Number(dbOrder.total),
    paymentMethod: dbOrder.payment_method as PaymentMethod,
    paymentStatus: dbOrder.payment_status,
    status: dbOrder.status as OrderStatus,
    consents: [],
    notes: dbOrder.notes,
    createdAt: new Date(dbOrder.created_at).getTime(),
    updatedAt: new Date(dbOrder.updated_at).getTime(),
    paidAt: dbOrder.paid_at ? new Date(dbOrder.paid_at).getTime() : undefined,
    shippedAt: dbOrder.shipped_at ? new Date(dbOrder.shipped_at).getTime() : undefined,
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at).getTime() : undefined
  };
}

// ============================================
// CHECKOUT FLOW
// ============================================

const CHECKOUT_STORAGE_KEY = 'ainfotech_checkout';

/**
 * Cria estado inicial do checkout
 */
export function createCheckoutState(cart: Cart): CheckoutState {
  const steps: CheckoutStep[] = [
    { id: 'cart', name: 'Carrinho', completed: true },
    { id: 'customer', name: 'Dados do Cliente', completed: false },
    { id: 'review', name: 'Revisão', completed: false },
    { id: 'legal', name: 'Termos Legais', completed: false },
    { id: 'payment', name: 'Pagamento', completed: false },
    { id: 'confirmation', name: 'Confirmação', completed: false }
  ];
  
  return {
    currentStep: 1,
    steps,
    cart,
    consents: [],
    isComplete: false
  };
}

/**
 * Salva estado do checkout
 */
export function saveCheckoutState(state: CheckoutState): void {
  try {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[Checkout] Erro ao salvar estado:', e);
  }
}

/**
 * Carrega estado do checkout
 */
export function loadCheckoutState(): CheckoutState | null {
  try {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CheckoutState;
    }
  } catch (e) {
    console.error('[Checkout] Erro ao carregar estado:', e);
  }
  return null;
}

/**
 * Limpa estado do checkout
 */
export function clearCheckoutState(): void {
  localStorage.removeItem(CHECKOUT_STORAGE_KEY);
}

/**
 * Avança para próximo passo do checkout
 */
export function advanceCheckoutStep(state: CheckoutState): CheckoutState {
  if (state.currentStep >= state.steps.length - 1) {
    return state;
  }
  
  // Marca passo atual como completo
  state.steps[state.currentStep].completed = true;
  state.steps[state.currentStep].timestamp = Date.now();
  
  // Avança
  state.currentStep += 1;
  
  saveCheckoutState(state);
  return state;
}

/**
 * Volta para passo anterior do checkout
 */
export function goBackCheckoutStep(state: CheckoutState): CheckoutState {
  if (state.currentStep <= 0) {
    return state;
  }
  
  state.currentStep -= 1;
  saveCheckoutState(state);
  return state;
}

/**
 * Define dados do cliente no checkout
 */
export function setCustomerInfo(state: CheckoutState, customer: CustomerInfo): CheckoutState {
  state.customer = customer;
  saveCheckoutState(state);
  return state;
}

/**
 * Define método de pagamento
 */
export function setPaymentMethod(state: CheckoutState, method: PaymentMethod): CheckoutState {
  state.paymentMethod = method;
  saveCheckoutState(state);
  return state;
}

/**
 * Registra consentimento legal
 */
export function recordConsent(
  state: CheckoutState,
  type: ConsentType,
  accepted: boolean
): CheckoutState {
  const consent: LegalConsent = {
    id: `consent-${Date.now()}`,
    type,
    accepted,
    timestamp: Date.now(),
    ipAddress: '', // Será preenchido no backend
    userAgent: navigator.userAgent,
    version: LEGAL_TEXTS[type].version
  };
  
  // Remove consentimento anterior do mesmo tipo
  state.consents = state.consents.filter(c => c.type !== type);
  state.consents.push(consent);
  
  saveCheckoutState(state);
  return state;
}

/**
 * Verifica se todos os consentimentos obrigatórios foram aceitos
 */
export function checkRequiredConsents(state: CheckoutState): {
  valid: boolean;
  missing: ConsentType[];
} {
  const required: ConsentType[] = [
    ConsentType.PURCHASE,
    ConsentType.DATA_PROCESSING,
    ConsentType.TERMS_OF_SERVICE
  ];
  
  const missing = required.filter(type => {
    const consent = state.consents.find(c => c.type === type);
    return !consent || !consent.accepted;
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// ============================================
// CRIAÇÃO DE PEDIDO
// ============================================

/**
 * Gera número do pedido
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .like('order_number', `PED-${year}-%`);
  
  const sequence = ((count || 0) + 1).toString().padStart(4, '0');
  return `PED-${year}-${sequence}`;
}

/**
 * Obtém IP do cliente (via API externa)
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Cria ou atualiza cliente
 */
async function upsertCustomer(customer: CustomerInfo): Promise<string> {
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customer.email)
    .single();
  
  const customerData = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    cpf_cnpj: customer.cpfCnpj,
    address_street: customer.address.street,
    address_number: customer.address.number,
    address_complement: customer.address.complement,
    address_neighborhood: customer.address.neighborhood,
    address_city: customer.address.city,
    address_state: customer.address.state,
    address_zipcode: customer.address.zipCode
  };
  
  if (existing) {
    await supabase
      .from('customers')
      .update(customerData)
      .eq('id', existing.id);
    return existing.id;
  }
  
  const { data: newCustomer } = await supabase
    .from('customers')
    .insert([customerData])
    .select('id')
    .single();
  
  return newCustomer?.id;
}

/**
 * Finaliza o pedido
 */
export async function createOrder(state: CheckoutState): Promise<ApiResponse<Order>> {
  try {
    // Validações
    if (!state.customer) {
      return { success: false, error: 'Dados do cliente não informados.' };
    }
    
    if (!state.paymentMethod) {
      return { success: false, error: 'Método de pagamento não selecionado.' };
    }
    
    const consentCheck = checkRequiredConsents(state);
    if (!consentCheck.valid) {
      return {
        success: false,
        error: `Consentimentos pendentes: ${consentCheck.missing.join(', ')}`
      };
    }
    
    if (state.cart.items.length === 0) {
      return { success: false, error: 'Carrinho está vazio.' };
    }
    
    // Valida carrinho (estoque e preços)
    const cartValidation = await cartService.validateCart();
    if (!cartValidation.valid) {
      return {
        success: false,
        error: 'Alguns itens do carrinho não estão mais disponíveis.'
      };
    }
    
    // Gera número do pedido
    const orderNumber = await generateOrderNumber();
    
    // Obtém IP para registro de consentimento
    const clientIP = await getClientIP();
    
    // Cria/atualiza cliente
    const customerId = await upsertCustomer(state.customer);
    
    // Cria pedido
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_id: customerId,
        subtotal: state.cart.subtotal,
        discount: state.cart.discount,
        shipping_cost: state.cart.shippingCost,
        total: state.cart.total,
        payment_method: state.paymentMethod,
        payment_status: 'pending',
        status: OrderStatus.PENDING,
        customer_snapshot: state.customer,
        notes: ''
      }])
      .select()
      .single();
    
    if (orderError) {
      return { success: false, error: orderError.message };
    }
    
    // Cria itens do pedido
    const orderItems = state.cart.items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      product_sku: item.product.sku,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      // Rollback: exclui pedido
      await supabase.from('orders').delete().eq('id', orderData.id);
      return { success: false, error: itemsError.message };
    }
    
    // Registra consentimentos
    const consentsData = state.consents.map(consent => ({
      order_id: orderData.id,
      customer_id: customerId,
      consent_type: consent.type,
      accepted: consent.accepted,
      version: consent.version,
      ip_address: clientIP,
      user_agent: consent.userAgent
    }));
    
    await supabase.from('legal_consents').insert(consentsData);
    
    // Decrementa estoque (trigger no banco já faz isso, mas garantimos aqui)
    for (const item of state.cart.items) {
      const product = await productService.fetchOwnProductById(item.productId);
      if (product) {
        await productService.updateStock(
          item.productId,
          product.stockQuantity - item.quantity,
          'sale',
          orderData.id
        );
      }
    }
    
    // Limpa carrinho e checkout
    cartService.clearCart();
    clearCheckoutState();
    
    // Busca itens para retorno
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id);
    
    const order = mapOrderFromDB(orderData, items);
    order.consents = state.consents;
    
    return {
      success: true,
      data: order,
      message: `Pedido ${orderNumber} criado com sucesso!`
    };
    
  } catch (error: any) {
    console.error('[Order] Erro ao criar pedido:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CONSULTA DE PEDIDOS
// ============================================

/**
 * Busca pedido por número
 */
export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  
  if (error || !order) return null;
  
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);
  
  const { data: consents } = await supabase
    .from('legal_consents')
    .select('*')
    .eq('order_id', order.id);
  
  const mappedOrder = mapOrderFromDB(order, items);
  mappedOrder.consents = (consents || []).map(c => ({
    id: c.id,
    type: c.consent_type as ConsentType,
    accepted: c.accepted,
    timestamp: new Date(c.created_at).getTime(),
    ipAddress: c.ip_address,
    userAgent: c.user_agent,
    version: c.version
  }));
  
  return mappedOrder;
}

/**
 * Busca todos os pedidos (admin)
 */
export async function fetchOrders(options?: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const { status, page = 1, pageSize = 20 } = options || {};
  
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });
  
  if (status) query = query.eq('status', status);
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) return { orders: [], total: 0 };
  
  return {
    orders: (data || []).map(o => mapOrderFromDB(o)),
    total: count || 0
  };
}

/**
 * Atualiza status do pedido
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<ApiResponse<Order>> {
  try {
    const updates: Record<string, any> = { status: newStatus };
    
    // Atualiza timestamps específicos
    if (newStatus === OrderStatus.SHIPPED) {
      updates.shipped_at = new Date().toISOString();
    } else if (newStatus === OrderStatus.DELIVERED) {
      updates.delivered_at = new Date().toISOString();
    } else if (newStatus === OrderStatus.CANCELLED) {
      updates.cancelled_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Se cancelado, devolve estoque
    if (newStatus === OrderStatus.CANCELLED) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      for (const item of items || []) {
        const product = await productService.fetchOwnProductById(item.product_id);
        if (product) {
          await productService.updateStock(
            item.product_id,
            product.stockQuantity + item.quantity,
            'return',
            orderId,
            'Estorno por cancelamento de pedido'
          );
        }
      }
    }
    
    return {
      success: true,
      data: mapOrderFromDB(data),
      message: 'Status atualizado com sucesso!'
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// EXPORT
// ============================================

export const orderService = {
  // Checkout
  createCheckoutState,
  saveCheckoutState,
  loadCheckoutState,
  clearCheckoutState,
  advanceCheckoutStep,
  goBackCheckoutStep,
  setCustomerInfo,
  setPaymentMethod,
  recordConsent,
  checkRequiredConsents,
  
  // Pedidos
  createOrder,
  fetchOrderByNumber,
  fetchOrders,
  updateOrderStatus,
  
  // Textos Legais
  LEGAL_TEXTS
};
