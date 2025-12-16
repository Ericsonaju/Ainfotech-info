# AINFOTECH - Sistema de Gestão de O.S

Sistema de gerenciamento de ordens de serviço para assistência técnica, com painel administrativo Kanban e portal do cliente.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: TailwindCSS
- **Autenticação**: Supabase Auth
- **IA**: Google Gemini API (opcional)

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuita)
- Hospedagem HostGator (ou qualquer servidor Apache)

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/Ericsonaju/Ainfotech-info.git
cd Ainfotech-info
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
VITE_GEMINI_API_KEY=sua_chave_gemini (opcional)
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute localmente

```bash
npm run dev
```

### 5. Build para produção

```bash
npm run build
```

## 🌐 Deploy no HostGator

### Opção 1: Upload via Gerenciador de Arquivos

1. Execute `npm run build` localmente
2. Acesse o cPanel do HostGator
3. Vá em **Gerenciador de Arquivos**
4. Navegue até `public_html` (ou subpasta desejada)
5. Faça upload de **todo o conteúdo** da pasta `dist/`
6. Certifique-se de que o arquivo `.htaccess` foi incluído

### Opção 2: Upload via FTP

1. Execute `npm run build` localmente
2. Use FileZilla ou outro cliente FTP
3. Conecte com suas credenciais do HostGator
4. Navegue até `public_html`
5. Faça upload de **todo o conteúdo** da pasta `dist/`

### Estrutura após deploy

```
public_html/
├── .htaccess        (roteamento SPA)
├── index.html       (página principal)
└── assets/          (JS, CSS e imagens)
```

## 🗄️ Configuração do Supabase

### Tabela `tasks` (SQL)

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_cpf TEXT,
  client_address TEXT,
  equipment TEXT,
  serial_number TEXT,
  priority TEXT DEFAULT 'medium',
  column_id TEXT DEFAULT 'entry',
  subtasks JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  chat_history JSONB DEFAULT '[]',
  signature TEXT,
  tech_signature TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  tags JSONB DEFAULT '[]',
  service_cost DECIMAL(10,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  technical_observation TEXT,
  photos JSONB DEFAULT '[]',
  budget_expiry_date BIGINT
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso anônimo (apenas para demo)
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
```

### Autenticação (opcional)

Configure autenticação por email no painel do Supabase.

## 📱 Funcionalidades

- ✅ Painel Kanban para gestão de O.S.
- ✅ Portal do cliente para acompanhamento
- ✅ Geração de orçamentos em PDF
- ✅ Assinatura digital
- ✅ Chat interno cliente/técnico
- ✅ Dashboard com relatórios
- ✅ Sugestões com IA (opcional)
- ✅ Responsivo para mobile

## 🔒 Segurança

O arquivo `.htaccess` inclui:

- Headers de segurança (X-Frame-Options, X-XSS-Protection)
- Proteção contra sniffing de MIME type
- Compressão GZIP para performance

## 📄 Licença

Projeto desenvolvido por AINFOTECH - Assistência Técnica.
