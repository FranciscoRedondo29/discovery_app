-- ========================================
-- RPC Function: Get Detailed Pedidos with Solicitante Info
-- ========================================
-- This function bypasses RLS to fetch solicitante details for pending requests

CREATE OR REPLACE FUNCTION get_pedidos_detalhados(destinatario_id_input UUID)
RETURNS TABLE (
  id UUID,
  solicitante_id UUID,
  solicitante_tipo TEXT,
  solicitante_nome TEXT,
  solicitante_email TEXT,
  instituicao TEXT,
  ano_escolaridade INTEGER,
  funcao TEXT,
  destinatario_id UUID,
  destinatario_tipo TEXT,
  status TEXT,
  criado_em TIMESTAMPTZ,
  respondido_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is the destinatario
  IF auth.uid() != destinatario_id_input THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Return pedidos with solicitante details
  RETURN QUERY
  SELECT 
    p.id,
    p.solicitante_id,
    p.solicitante_tipo,
    COALESCE(a.nome, pr.nome, '') as solicitante_nome,
    COALESCE(a.email, pr.email, '') as solicitante_email,
    COALESCE(a.escola_instituicao, pr.escola_instituicao, '') as instituicao,
    a.ano_escolaridade,
    pr.funcao,
    p.destinatario_id,
    p.destinatario_tipo,
    p.status,
    p.criado_em,
    p.respondido_em
  FROM pedidos p
  LEFT JOIN alunos a ON p.solicitante_tipo = 'aluno' AND p.solicitante_id = a.id
  LEFT JOIN profissionais pr ON p.solicitante_tipo = 'profissional' AND p.solicitante_id = pr.id
  WHERE p.destinatario_id = destinatario_id_input
    AND p.status = 'pendente'
  ORDER BY p.criado_em DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_pedidos_detalhados(UUID) TO authenticated;

COMMENT ON FUNCTION get_pedidos_detalhados IS 'Fetches pending pedidos with solicitante details, bypassing RLS restrictions';
