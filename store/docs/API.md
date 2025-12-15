# 📚 AINFOTECH E-COMMERCE - Documentação de APIs

## Serviços Disponíveis

---

## 1. ProductService

Gerencia produtos próprios (Domínio A).

### Funções

#### `fetchOwnProducts(options?)`
Busca produtos próprios com paginação e filtros.

```typescript
import { productService } from '@/store';

const result = await productService.fetchOwnProducts({
  category: ProductCategory.NOTEBOOKS,
  status: ProductStatus.ACTIVE,
  search: 'dell',
  page: 1,
  pageSize: 20
});

// Retorno
{
  data: OwnProduct[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

#### `fetchOwnProductById(id)`
Busca produto por ID.

```typescript
const product = await productService.fetchOwnProductById('uuid-aqui');
```

#### `createOwnProduct(productData)`
Cria novo produto.

```typescript
const result = await productService.createOwnProduct({
  sku: 'NOT-DELL-001',
  name: 'Notebook Dell Inspiron',
  description: 'Notebook para uso profissional',
  technicalSpecs: 'Intel i7, 16GB RAM, 512GB SSD',
  category: ProductCategory.NOTEBOOKS,
  images: [],
  tags: ['notebook', 'dell'],
  costPrice: 3500,
  profitMargin: 30, // 30%
  stockQuantity: 10,
  minStockAlert: 3,
  warrantyDays: 365,
  weight: 2.5,
  dimensions: { width: 35, height: 2, depth: 25 },
  origin: 'imported'
});

// Retorno
{
  success: boolean,
  data?: OwnProduct,
  error?: string,
  message?: string
}
```

#### `updateOwnProduct(id, updates)`
Atualiza produto.

```typescript
const result = await productService.updateOwnProduct(
  'uuid-aqui',
  { costPrice: 3800, profitMargin: 25 }
);
```

#### `deleteOwnProduct(id)`
Exclui produto.

```typescript
const result = await productService.deleteOwnProduct('uuid-aqui');
```

#### `updateStock(productId, newQuantity, reason, orderId?, notes?)`
Atualiza estoque com histórico.

```typescript
const result = await productService.updateStock(
  'uuid-aqui',
  15,
  'restock',
  null,
  'Reposição de estoque'
);
```

#### `checkStockAvailability(productId, quantity)`
Verifica disponibilidade.

```typescript
const check = await productService.checkStockAvailability('uuid', 5);
// { available: true, currentStock: 10 }
```

#### `calculateFinalPrice(costPrice, profitMargin)`
Calcula preço final.

```typescript
const price = productService.calculateFinalPrice(100, 30);
// 130
```

---

## 2. CartService

Gerencia carrinho de compras (localStorage).

### Funções

#### `getCart()`
Obtém carrinho atual.

```typescript
import { cartService } from '@/store';

const cart = cartService.getCart();
// { id, items, subtotal, discount, shippingCost, total, ... }
```

#### `addToCart(productId, quantity?)`
Adiciona produto ao carrinho.

```typescript
const result = await cartService.addToCart('uuid', 2);
// { success: true, cart: Cart, message?: string }
```

#### `removeFromCart(itemId)`
Remove item do carrinho.

```typescript
const cart = cartService.removeFromCart('item-id');
```

#### `updateItemQuantity(itemId, newQuantity)`
Atualiza quantidade.

```typescript
const result = await cartService.updateItemQuantity('item-id', 3);
```

#### `applyDiscount(amount)`
Aplica desconto.

```typescript
const cart = cartService.applyDiscount(50);
```

#### `setShippingCost(cost)`
Define frete.

```typescript
const cart = cartService.setShippingCost(25);
```

#### `clearCart()`
Limpa carrinho.

```typescript
const cart = cartService.clearCart();
```

#### `validateCart()`
Valida estoque e preços de todos os itens.

```typescript
const validation = await cartService.validateCart();
// { valid: boolean, cart: Cart, invalidItems: [], priceChanges: [] }
```

---

## 3. OrderService

Gerencia pedidos e checkout.

### Funções

#### `createCheckoutState(cart)`
Inicia estado do checkout.

```typescript
import { orderService } from '@/store';

const state = orderService.createCheckoutState(cart);
```

#### `setCustomerInfo(state, customer)`
Define dados do cliente.

```typescript
const newState = orderService.setCustomerInfo(state, {
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(79) 99999-9999',
  cpfCnpj: '123.456.789-00',
  address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'Aracaju',
    state: 'SE',
    zipCode: '49000-000'
  }
});
```

#### `recordConsent(state, type, accepted)`
Registra consentimento legal.

```typescript
const newState = orderService.recordConsent(
  state,
  ConsentType.PURCHASE,
  true
);
```

#### `setPaymentMethod(state, method)`
Define método de pagamento.

```typescript
const newState = orderService.setPaymentMethod(state, PaymentMethod.PIX);
```

#### `createOrder(state)`
Finaliza pedido.

```typescript
const result = await orderService.createOrder(state);
// { success: true, data: Order, message: 'Pedido PED-2024-0001 criado!' }
```

#### `fetchOrderByNumber(orderNumber)`
Busca pedido.

```typescript
const order = await orderService.fetchOrderByNumber('PED-2024-0001');
```

#### `updateOrderStatus(orderId, newStatus)`
Atualiza status.

```typescript
const result = await orderService.updateOrderStatus(
  'uuid',
  OrderStatus.SHIPPED
);
```

### Textos Legais

```typescript
import { LEGAL_TEXTS } from '@/store';

const purchaseTerms = LEGAL_TEXTS[ConsentType.PURCHASE];
// { version: '1.0', title: 'Termos de Compra', text: '...' }
```

---

## 4. MercadoLivreService

Integração com Mercado Livre.

### Funções

#### `isValidMLUrl(url)`
Valida URL do ML.

```typescript
import { mercadoLivreService } from '@/store';

const isValid = mercadoLivreService.isValidMLUrl(
  'https://www.mercadolivre.com.br/...'
);
// true
```

#### `extractProductId(url)`
Extrai ID do produto.

```typescript
const id = mercadoLivreService.extractProductId(url);
// 'MLB123456789'
```

#### `extractMLProductData(url)`
Extrai dados do produto.

```typescript
const result = await mercadoLivreService.extractMLProductData(url);
// {
//   success: true,
//   data: {
//     title: 'Notebook Dell',
//     price: 3500,
//     images: ['url1', 'url2'],
//     description: '...',
//     seller: 'Loja XYZ',
//     freeShipping: true,
//     ...
//   }
// }
```

#### `convertToAffiliateProduct(data, affiliateUrl, originalUrl)`
Converte para formato de produto afiliado.

```typescript
const product = mercadoLivreService.convertToAffiliateProduct(
  extractedData,
  affiliateUrl,
  originalUrl
);
```

#### `syncAffiliateProduct(productId)`
Sincroniza dados atualizados.

```typescript
const result = await mercadoLivreService.syncAffiliateProduct('uuid');
```

---

## 5. AdGeneratorService

Geração de anúncios com IA.

### Funções

#### `generateAd(input)`
Gera anúncio para produto.

```typescript
import { adGeneratorService } from '@/store';

const result = await adGeneratorService.generateAd({
  product: myProduct,
  platform: 'instagram',
  tone: 'casual',
  targetAudience: 'Jovens profissionais'
});

// {
//   success: true,
//   data: {
//     id: 'ad-123',
//     headline: '💻 Notebook Dell em PROMOÇÃO!',
//     body: 'Chegou o notebook que você...',
//     callToAction: 'Compre agora!',
//     hashtags: ['#notebook', '#dell', ...],
//     seoKeywords: ['notebook dell', ...],
//     legalDisclaimer: 'Garantia conforme CDC.',
//     platform: 'instagram',
//     aiModel: 'gemini-2.0-flash'
//   }
// }
```

#### `generateMultiPlatformAds(product, platforms)`
Gera anúncios para múltiplas plataformas.

```typescript
const result = await adGeneratorService.generateMultiPlatformAds(
  product,
  ['instagram', 'facebook', 'whatsapp']
);
// { success: true, data: GeneratedAd[] }
```

#### `fetchProductAds(productId)`
Busca histórico de anúncios.

```typescript
const ads = await adGeneratorService.fetchProductAds('uuid');
```

### Configurações Disponíveis

```typescript
// Tons disponíveis
type Tone = 'professional' | 'casual' | 'urgent' | 'luxury';

// Plataformas
type Platform = 'instagram' | 'facebook' | 'google' | 'whatsapp' | 'general';
```

---

## 📊 Tipos Principais

### Product Types

```typescript
enum ProductType {
  OWN = 'own',
  AFFILIATE = 'affiliate'
}

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock'
}

enum ProductCategory {
  NOTEBOOKS = 'notebooks',
  DESKTOPS = 'desktops',
  SMARTPHONES = 'smartphones',
  // ...
}
```

### Order Types

```typescript
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BOLETO = 'boleto',
  CASH = 'cash'
}
```

### Consent Types

```typescript
enum ConsentType {
  PURCHASE = 'purchase',
  WARRANTY = 'warranty',
  DATA_PROCESSING = 'data_processing',
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy'
}
```

---

## 🔧 Exemplos de Uso

### Fluxo Completo de Compra

```typescript
import { cartService, orderService, ConsentType, PaymentMethod } from '@/store';

// 1. Adiciona ao carrinho
await cartService.addToCart('product-id', 2);

// 2. Inicia checkout
const cart = cartService.getCart();
let state = orderService.createCheckoutState(cart);

// 3. Define cliente
state = orderService.setCustomerInfo(state, customerData);

// 4. Registra consentimentos
state = orderService.recordConsent(state, ConsentType.PURCHASE, true);
state = orderService.recordConsent(state, ConsentType.DATA_PROCESSING, true);
state = orderService.recordConsent(state, ConsentType.TERMS_OF_SERVICE, true);

// 5. Define pagamento
state = orderService.setPaymentMethod(state, PaymentMethod.PIX);

// 6. Finaliza
const result = await orderService.createOrder(state);
if (result.success) {
  console.log('Pedido criado:', result.data.orderNumber);
}
```

### Importar Produto Afiliado

```typescript
import { mercadoLivreService, productService } from '@/store';

// 1. Extrai dados do ML
const extracted = await mercadoLivreService.extractMLProductData(mlUrl);

if (extracted.success && extracted.data) {
  // 2. Converte para produto
  const productData = mercadoLivreService.convertToAffiliateProduct(
    extracted.data,
    affiliateUrl,
    mlUrl
  );
  
  // 3. Salva
  const result = await productService.createAffiliateProduct(productData);
}
```

---

## ⚠️ Tratamento de Erros

Todas as funções retornam `ApiResponse`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Exemplo de tratamento:

```typescript
const result = await productService.createOwnProduct(data);

if (!result.success) {
  console.error('Erro:', result.error);
  showToast('Erro', result.error, 'error');
  return;
}

showToast('Sucesso', result.message, 'success');
```
