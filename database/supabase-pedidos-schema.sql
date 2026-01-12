-- ========================================
-- Pedidos Table: Pending requests for linking
-- ========================================

-- Table: pedidos (Requests/Invitations)
-- Stores pending requests from one user to another
-- Status: 'pendente' (pending), 'aceite' (accepted), 'recusado' (declined)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id UUID NOT NULL,
  solicitante_tipo TEXT NOT NULL CHECK (solicitante_tipo IN ('aluno', 'profissional')),
  destinatario_id UUID NOT NULL,
  destinatario_tipo TEXT NOT NULL CHECK (destinatario_tipo IN ('aluno', 'profissional')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceite', 'recusado')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondido_em TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_pending_request UNIQUE (solicitante_id, destinatario_id, status)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pedidos_solicitante ON pedidos(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_destinatario ON pedidos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);

-- Enable Row Level Security on pedidos table
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pedidos table
-- Users can view pedidos where they are solicitante or destinatario
CREATE POLICY "Users can view their pedidos"
  ON pedidos FOR SELECT
  USING (auth.uid() = solicitante_id OR auth.uid() = destinatario_id);

-- Users can insert pedidos where they are solicitante
CREATE POLICY "Users can create pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (auth.uid() = solicitante_id);

-- Users can update pedidos where they are destinatario (to accept/decline)
CREATE POLICY "Destinatario can update pedidos"
  ON pedidos FOR UPDATE
  USING (auth.uid() = destinatario_id)
  WITH CHECK (auth.uid() = destinatario_id);

-- ========================================
-- RPC Function: Create Pending Request
-- ========================================

CREATE OR REPLACE FUNCTION criar_pedido(
  destinatario_email TEXT,
  tipo_solicitante TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  solicitante_id_var UUID;
  destinatario_id_var UUID;
  tipo_destinatario TEXT;
  pedido_id_var UUID;
  result JSONB;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  solicitante_id_var := auth.uid();

  -- Lookup destinatario by email and determine type
  IF tipo_solicitante = 'aluno' THEN
    -- Aluno requesting profissional
    SELECT id INTO destinatario_id_var
    FROM profissionais
    WHERE LOWER(email) = LOWER(destinatario_email);
    tipo_destinatario := 'profissional';
  ELSIF tipo_solicitante = 'profissional' THEN
    -- Profissional requesting aluno
    SELECT id INTO destinatario_id_var
    FROM alunos
    WHERE LOWER(email) = LOWER(destinatario_email);
    tipo_destinatario := 'aluno';
  ELSE
    RAISE EXCEPTION 'Invalid solicitante type';
  END IF;

  -- Check if destinatario exists
  IF destinatario_id_var IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', CASE WHEN tipo_solicitante = 'aluno' 
                      THEN 'Profissional não encontrado'
                      ELSE 'Aluno não encontrado'
                 END
    );
  END IF;

  -- Check if already linked
  IF EXISTS (
    SELECT 1 FROM aluno_profissionais
    WHERE (aluno_id = solicitante_id_var AND profissional_id = destinatario_id_var)
       OR (aluno_id = destinatario_id_var AND profissional_id = solicitante_id_var)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Já estão ligados'
    );
  END IF;

  -- Check if pending request already exists
  IF EXISTS (
    SELECT 1 FROM pedidos
    WHERE solicitante_id = solicitante_id_var
      AND destinatario_id = destinatario_id_var
      AND status = 'pendente'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Pedido já foi enviado'
    );
  END IF;

  -- Create pending request
  INSERT INTO pedidos (
    solicitante_id,
    solicitante_tipo,
    destinatario_id,
    destinatario_tipo,
    status
  ) VALUES (
    solicitante_id_var,
    tipo_solicitante,
    destinatario_id_var,
    tipo_destinatario,
    'pendente'
  ) RETURNING id INTO pedido_id_var;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido enviado com sucesso',
    'pedido_id', pedido_id_var
  );
END;
$$;

GRANT EXECUTE ON FUNCTION criar_pedido(TEXT, TEXT) TO authenticated;

-- ========================================
-- RPC Function: Accept Pending Request
-- ========================================

CREATE OR REPLACE FUNCTION aceitar_pedido(pedido_id_input UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pedido RECORD;
  aluno_id_var UUID;
  profissional_id_var UUID;
  result JSONB;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get pedido
  SELECT * INTO pedido
  FROM pedidos
  WHERE id = pedido_id_input;

  -- Check if pedido exists
  IF pedido IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Pedido não encontrado'
    );
  END IF;

  -- Verify current user is destinatario
  IF pedido.destinatario_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso não autorizado'
    );
  END IF;

  -- Determine aluno and profissional IDs
  IF pedido.solicitante_tipo = 'aluno' THEN
    aluno_id_var := pedido.solicitante_id;
    profissional_id_var := pedido.destinatario_id;
  ELSE
    aluno_id_var := pedido.destinatario_id;
    profissional_id_var := pedido.solicitante_id;
  END IF;

  -- Create the actual link
  INSERT INTO aluno_profissionais (aluno_id, profissional_id)
  VALUES (aluno_id_var, profissional_id_var)
  ON CONFLICT DO NOTHING;

  -- Update pedido status
  UPDATE pedidos
  SET status = 'aceite', respondido_em = NOW()
  WHERE id = pedido_id_input;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido aceite com sucesso'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION aceitar_pedido(UUID) TO authenticated;

-- ========================================
-- RPC Function: Decline Pending Request
-- ========================================

CREATE OR REPLACE FUNCTION recusar_pedido(pedido_id_input UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pedido RECORD;
  result JSONB;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get pedido
  SELECT * INTO pedido
  FROM pedidos
  WHERE id = pedido_id_input;

  -- Check if pedido exists
  IF pedido IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Pedido não encontrado'
    );
  END IF;

  -- Verify current user is destinatario
  IF pedido.destinatario_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso não autorizado'
    );
  END IF;

  -- Update pedido status
  UPDATE pedidos
  SET status = 'recusado', respondido_em = NOW()
  WHERE id = pedido_id_input;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido recusado'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION recusar_pedido(UUID) TO authenticated;
