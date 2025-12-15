# 🛒 AINFOTECH E-COMMERCE

Plataforma de vendas completa integrada ao sistema AINFOTECH, com suporte a produtos próprios e afiliados do Mercado Livre.

## 🎯 Características

### Domínio A - Produtos Próprios
- ✅ CRUD completo de produtos
- ✅ Cálculo automático de preço (custo + margem)
- ✅ Controle de estoque com histórico
- ✅ Checkout com conformidade CDC/LGPD
- ✅ Múltiplos métodos de pagamento

### Domínio B - Produtos Afiliados
- ✅ Importação automática do Mercado Livre
- ✅ Extração de título, imagens, preço
- ✅ Cache de dados (24h)
- ✅ Aviso legal obrigatório
- ✅ Redirecionamento para ML

### IA Generativa
- ✅ Geração automática de anúncios
- ✅ Otimização para múltiplas plataformas
- ✅ Revisão legal automática
- ✅ SEO otimizado

## 📦 Instalação

```bash
# Já está integrado ao projeto principal
# Basta importar do módulo /store
```

## 🚀 Uso Rápido

```typescript
// Importar componentes
import { StorePage, ProductCard, CheckoutFlow } from './store';

// Importar serviços
import { productService, cartService, orderService } from './store';

// Importar tipos
import { Product, Order, CartItem } from './store';
```

## 📁 Estrutura

```
/store
├── /components       # Componentes React
├── /services         # Lógica de negócio
├── /types           # TypeScript
├── /database        # Schema SQL
├── /docs            # Documentação
└── index.ts         # Exports
```

## 🗄️ Database Setup

Execute o schema SQL no Supabase:

```bash
# Copie o conteúdo de /store/database/schema.sql
# Cole no SQL Editor do Supabase
```

## ⚙️ Variáveis de Ambiente

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## ⚖️ Conformidade Legal

- **CDC**: Código de Defesa do Consumidor
- **LGPD**: Lei Geral de Proteção de Dados
- **Marco Civil**: Lei 12.965/14

Todos os consentimentos são registrados com:
- Timestamp
- IP do cliente
- User Agent
- Versão do termo

## 📊 API Principal

| Serviço | Descrição |
|---------|-----------|
| `productService` | CRUD de produtos |
| `cartService` | Gerenciamento do carrinho |
| `orderService` | Pedidos e checkout |
| `mercadoLivreService` | Integração com ML |
| `adGeneratorService` | Geração de anúncios IA |

## 🔐 Segurança

- Row Level Security (RLS) no Supabase
- Validação de estoque antes da venda
- Sanitização de inputs
- Registro de auditoria

## 📱 Componentes

| Componente | Descrição |
|------------|-----------|
| `StorePage` | Página principal da loja |
| `ProductCard` | Card de produto |
| `AffiliateImporter` | Importador do ML |
| `CheckoutFlow` | Fluxo de checkout |

## 📖 Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [API](./docs/API.md)
- [Legal](./docs/LEGAL.md)

## 👥 Autor

**AINFOTECH Informática**  
Aracaju - Sergipe - Brasil

---

MIT License
