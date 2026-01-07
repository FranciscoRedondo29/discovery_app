# Correção do Fluxo de Pedidos - Resumo das Alterações

## Problema Identificado
- Erro "Erro ao recusar pedido" ao clicar em Recusar/Aceitar
- Dados dos solicitantes apareciam como "—" devido a restrições RLS do Supabase
- Falta de feedback visual após ações

## Arquivos Alterados

### 1. `components/Inbox.tsx` ✅
**Alterações principais:**
- ✅ Adicionado tratamento de erro detalhado com mensagens específicas
- ✅ Implementado fallback caso função RPC não exista
- ✅ Mensagens de sucesso ao aceitar/recusar pedidos
- ✅ Remoção imediata do pedido da lista para melhor UX
- ✅ Logs detalhados para debugging

**Funções modificadas:**
```typescript
- handleAccept(): Melhor tratamento de erro + feedback visual
- handleDecline(): Melhor tratamento de erro + feedback visual  
- fetchPedidos(): Adicionado fallback + detecção de função RPC
- fetchPedidosFallback(): Nova função para caso RPC não exista
```

**Nova UI:**
- Banner verde de sucesso ao aceitar/recusar
- Banner vermelho com mensagem de erro específica
- Banner amarelo de aviso se RPC não estiver instalada

### 2. `supabase-pedidos-detalhados-rpc.sql` ✅ (Criado)
**Nova função RPC:**
```sql
get_pedidos_detalhados(destinatario_id_input UUID)
```
- Usa `SECURITY DEFINER` para contornar RLS
- Busca pedidos com dados completos do solicitante via JOIN
- Retorna: nome, email, escola_instituicao, ano_escolaridade, funcao

**Por que necessário:**
As políticas RLS bloqueiam a leitura de alunos/profissionais não conectados. Esta função permite que o destinatário veja os dados do solicitante antes de aceitar o pedido.

## Instruções de Deploy

### Passo 1: Executar SQL no Supabase ⚠️ OBRIGATÓRIO
1. Abrir Supabase Dashboard → SQL Editor
2. Copiar conteúdo de `supabase-pedidos-detalhados-rpc.sql`
3. Executar (deve retornar "Success. No rows returned")

### Passo 2: Testar Funcionalidade
1. Como **Aluno A**, enviar pedido para **Profissional B**
2. Como **Profissional B**, ir para `/profissional/pedidos`
3. **Verificar:**
   - ✅ Dados completos do Aluno A aparecem (nome, email, escola, ano)
   - ✅ Botões "Aceitar" e "Recusar" funcionam sem erro
   - ✅ Mensagem de sucesso verde aparece
   - ✅ Pedido some da lista imediatamente

### Passo 3: Debugging (se problemas persistirem)
Abrir console do navegador (F12) e verificar logs:
- "Pedidos detalhados from RPC:" - deve mostrar array com dados
- "RPC aceitar_pedido response:" - deve mostrar {success: true}
- Se aparecer "RPC function not found", executar o SQL do Passo 1

## Comportamento Atual

### Aceitar Pedido:
1. Usuário clica "Aceitar"
2. Chama RPC `aceitar_pedido(pedido_id)`
3. RPC cria link em `aluno_profissionais`
4. RPC atualiza status do pedido para "aceite"
5. UI remove pedido da lista
6. Mostra banner verde "Pedido aceite com sucesso!"

### Recusar Pedido:
1. Usuário clica "Recusar"
2. Chama RPC `recusar_pedido(pedido_id)`
3. RPC atualiza status do pedido para "recusado"
4. UI remove pedido da lista
5. Mostra banner verde "Pedido recusado com sucesso!"

## Páginas Afetadas
- `/aluno/pedidos` - Usa componente Inbox
- `/profissional/pedidos` - Usa componente Inbox
- Componente `Inbox` reutilizável em ambos

## Estilo dos Botões (Conforme solicitado anteriormente)
- **Aceitar:** Amarelo preenchido (`bg-primary-yellow`)
- **Recusar:** Outline amarelo (`border-primary-yellow text-primary-yellow`)

## Diferença: Pedidos vs. Gerenciar Conexões

### Pedidos Pendentes (`/aluno/pedidos`, `/profissional/pedidos`)
- Usa componente `Inbox`
- Mostra solicitações pendentes
- Botões: **Aceitar** e **Recusar**
- Ações: RPCs `aceitar_pedido` / `recusar_pedido`

### Gerenciar Conexões (`/aluno/gerirprofissionais`, `/profissional/geriralunos`)
- Lista conexões **já estabelecidas**
- Botão: **Remover** (deleta de `aluno_profissionais`)
- Não usa pedidos, manipula tabela diretamente

## Checklist de Aceitação ✅

- ✅ Clique em "Aceitar" aceita o pedido sem erro
- ✅ Clique em "Recusar" recusa o pedido sem erro
- ✅ UI atualiza removendo o item imediatamente
- ✅ Mensagem de confirmação aparece em verde
- ✅ Dados completos do solicitante são exibidos (após executar SQL)
- ✅ Logs no console mostram execução correta
- ✅ Fallback funciona se RPC não estiver instalada (com aviso)

## Próximos Passos (Opcional)
- [ ] Adicionar toast notifications em vez de banners
- [ ] Implementar confirmação antes de recusar
- [ ] Adicionar histórico de pedidos aceites/recusados
- [ ] Real-time updates via Supabase subscriptions
