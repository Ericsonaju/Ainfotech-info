# Correção de Row Level Security (RLS)

Este diretório contém scripts SQL para corrigir problemas de segurança relacionados ao Row Level Security (RLS) no Supabase.

## Problemas Identificados

O linter do Supabase identificou os seguintes erros de segurança:

1. **policy_exists_rls_disabled**: Tabelas `products` e `affiliate_products` têm políticas RLS criadas, mas o RLS não está habilitado nas tabelas.

2. **rls_disabled_in_public**: As seguintes tabelas são públicas mas não têm RLS habilitado:
   - `order_items`
   - `products`
   - `stock_history`
   - `price_history`
   - `generated_ads`
   - `ml_cache`
   - `affiliate_products`

## Scripts Disponíveis

### 1. `enable_rls_fix.sql` (Recomendado - Rápido)

Script focado e direto que resolve especificamente os erros do linter. É idempotente e seguro para executar múltiplas vezes.

**Como usar:**
1. Abra o Supabase Dashboard
2. Vá para SQL Editor
3. Cole e execute o conteúdo de `enable_rls_fix.sql`
4. Verifique o resultado na seção de verificação no final do script

### 2. `fix_rls_security.sql` (Completo)

Script completo que remove todas as políticas existentes e recria do zero. Use este script se quiser uma configuração limpa de todas as políticas RLS.

**Como usar:**
1. Abra o Supabase Dashboard
2. Vá para SQL Editor
3. Cole e execute o conteúdo de `fix_rls_security.sql`
4. Execute a query de verificação comentada no final do script

## O que os scripts fazem

1. **Habilitam RLS** em todas as tabelas mencionadas nos erros
2. **Removem políticas antigas** que podem estar causando conflitos
3. **Criam políticas adequadas** para cada tabela:
   - **Produtos** (`products`, `affiliate_products`): Leitura pública para produtos ativos, gerenciamento completo para usuários autenticados
   - **Pedidos** (`orders`, `order_items`): Criação pública (checkout), leitura e gerenciamento para autenticados
   - **Históricos** (`stock_history`, `price_history`): Leitura pública, escrita para autenticados
   - **Cache e Anúncios** (`ml_cache`, `generated_ads`): Acesso público para leitura/escrita

## Verificação

Após executar qualquer um dos scripts, você pode verificar se o RLS está habilitado executando:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'products',
        'affiliate_products',
        'order_items',
        'stock_history',
        'price_history',
        'generated_ads',
        'ml_cache'
    )
ORDER BY tablename;
```

Todas as tabelas devem mostrar `rls_enabled = true`.

## Notas Importantes

- ⚠️ **Backup**: Sempre faça backup do banco de dados antes de executar scripts de alteração de segurança
- ✅ **Idempotente**: Ambos os scripts são seguros para executar múltiplas vezes
- 🔒 **Segurança**: Após executar, todas as tabelas públicas terão RLS habilitado, melhorando a segurança do banco de dados
- 📝 **Logs**: Verifique os logs do Supabase após a execução para garantir que não houve erros

## Próximos Passos

Após executar o script:
1. Execute o linter do Supabase novamente para verificar se os erros foram resolvidos
2. Teste as funcionalidades da aplicação para garantir que as políticas RLS não quebraram nenhuma funcionalidade
3. Monitore os logs de acesso para garantir que as políticas estão funcionando corretamente
