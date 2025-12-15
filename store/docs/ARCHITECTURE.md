# 🏗️ AINFOTECH E-COMMERCE - Arquitetura do Sistema

## Visão Geral

Sistema de vendas completo integrado ao repositório AINFOTECH, suportando:
- **Domínio A**: Produtos Próprios (Venda Direta)
- **Domínio B**: Produtos Afiliados (Divulgação via Mercado Livre)

### Localização
- **Cidade**: Aracaju, Sergipe, Brasil
- **Legislação**: CDC, LGPD, Marco Civil da Internet

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │  StorePage   │  │ CheckoutFlow │  │  AdminPanel  │             │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│          │                 │                 │                       │
│   ┌──────▼─────────────────▼─────────────────▼───────┐              │
│   │                    SERVICES                       │              │
│   ├───────────────────────────────────────────────────┤              │
│   │  productService  │  cartService  │  orderService │              │
│   │  mercadoLivreService  │  adGeneratorService      │              │
│   └───────────────────────────┬───────────────────────┘              │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   SUPABASE (Backend)   │
                    ├────────────────────────┤
                    │  • PostgreSQL          │
                    │  • Row Level Security  │
                    │  • Real-time           │
                    │  • Storage             │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────┐  ┌────────────▼────────────┐  ┌──────▼──────┐
│   Produtos    │  │        Pedidos          │  │    Cache    │
│  (Próprios)   │  │  (Orders + Items)       │  │  (ML Data)  │
│               │  │  (Legal Consents)       │  │             │
└───────────────┘  └─────────────────────────┘  └─────────────┘

        ┌───────────────────────────────────────────────┐
        │              INTEGRAÇÕES EXTERNAS             │
        ├───────────────────────────────────────────────┤
        │  • Mercado Livre API (produtos afiliados)     │
        │  • Google Gemini API (geração de anúncios)    │
        │  • ViaCEP (consulta de endereços)            │
        └───────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
/store
├── /components           # Componentes React da loja
│   ├── ProductCard.tsx       # Card de exibição de produto
│   ├── AffiliateImporter.tsx # Modal de importação ML
│   ├── CheckoutFlow.tsx      # Fluxo completo de checkout
│   └── StorePage.tsx         # Página principal da loja
│
├── /services             # Serviços de negócio
│   ├── productService.ts     # CRUD de produtos
│   ├── cartService.ts        # Gerenciamento do carrinho
│   ├── orderService.ts       # Pedidos e checkout
│   ├── mercadoLivreService.ts # Integração ML
│   └── adGeneratorService.ts # Pipeline de IA para anúncios
│
├── /types                # Definições TypeScript
│   └── index.ts              # Interfaces e enums
│
├── /database             # Scripts SQL
│   └── schema.sql            # Schema do banco de dados
│
├── /docs                 # Documentação
│   ├── ARCHITECTURE.md       # Este arquivo
│   ├── API.md               # Documentação de APIs
│   └── LEGAL.md             # Templates legais
│
└── index.ts              # Exportações do módulo
```

---

## 🔄 Fluxo de Dados

### Fluxo de Compra (Produtos Próprios)

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  Loja   │ -> │ Carrinho │ -> │  Checkout   │ -> │  Pedido  │
└─────────┘    └──────────┘    └─────────────┘    └──────────┘
     │              │                │                  │
     │              │                │                  │
     ▼              ▼                ▼                  ▼
 Exibe         Valida           Coleta             Registra
 produtos      estoque          dados              consents
                               legais
```

### Fluxo de Importação (Produtos Afiliados)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│ Link do ML  │ -> │  Extração   │ -> │   Preview   │ -> │  Salvar  │
└─────────────┘    └─────────────┘    └─────────────┘    └──────────┘
      │                  │                  │                 │
      │                  │                  │                 │
      ▼                  ▼                  ▼                 ▼
  Valida URL         Busca API         Permite           Cadastra
  do ML              do ML             edição            produto
```

---

## 🗄️ Modelo de Dados

### Tabelas Principais

| Tabela | Descrição | Domínio |
|--------|-----------|---------|
| `products` | Produtos próprios | A |
| `affiliate_products` | Produtos afiliados | B |
| `orders` | Pedidos | A |
| `order_items` | Itens dos pedidos | A |
| `customers` | Clientes | - |
| `legal_consents` | Consentimentos legais | - |
| `stock_history` | Histórico de estoque | A |
| `price_history` | Histórico de preços | A |
| `generated_ads` | Anúncios gerados por IA | - |
| `ml_cache` | Cache do Mercado Livre | B |

### Relacionamentos

```
customers 1 ─── N orders
orders    1 ─── N order_items
orders    1 ─── N legal_consents
products  1 ─── N order_items
products  1 ─── N stock_history
products  1 ─── N price_history
```

---

## 🔐 Segurança

### Row Level Security (RLS)

- Produtos: Leitura pública
- Pedidos: Acesso autenticado
- Clientes: Acesso autenticado
- Consentimentos: Acesso autenticado

### Validações

1. **Estoque**: Bloqueia venda sem estoque
2. **Preços**: Recalcula automaticamente
3. **Consents**: Obriga aceite antes da compra
4. **Arquivos**: Valida tipo e tamanho

---

## 📈 Escalabilidade

### Otimizações Implementadas

1. **Cache de ML**: 24h de validade
2. **Paginação**: Todas as listagens
3. **Índices**: Em todas as buscas frequentes
4. **Lazy Loading**: Imagens e componentes

### Recomendações para Produção

1. Implementar CDN para imagens
2. Adicionar Redis para cache
3. Configurar rate limiting
4. Implementar queue para IA

---

## 🚀 Deploy

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Build

```bash
npm run build
```

### Vercel

O projeto inclui `vercel.json` configurado para SPA.
