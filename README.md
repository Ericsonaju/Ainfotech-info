# Ainfotech Info - Kanban Flow Service Desk

Sistema de gerenciamento de serviços com interface Kanban.

## 🚀 Deploy na Vercel

Este projeto está configurado para deploy na Vercel. Siga os passos:

### Via GitHub (Recomendado)

1. Faça push deste projeto para o seu repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "Add New Project"
4. Importe o repositório do GitHub
5. Configure as variáveis de ambiente (se necessário):
   - `GEMINI_API_KEY` - Sua chave da API Gemini
   - `VITE_SUPABASE_URL` - URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
6. Clique em "Deploy"

### Configurações Detectadas Automaticamente

- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 💻 Desenvolvimento Local

**Pré-requisitos:** Node.js 18+

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente criando um arquivo `.env.local`:

   ```
   GEMINI_API_KEY=sua_chave_aqui
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000`

## 📦 Build de Produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Recharts
- Lucide Icons
- Google Gemini AI
