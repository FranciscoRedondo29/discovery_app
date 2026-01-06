# Guia: Como Adicionar Áudios MP4 à Tabela Exercises

## Passo 1: Executar a Migração SQL

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá para **SQL Editor**
3. Abra o arquivo `supabase-add-audio-columns.sql`
4. Execute o SQL para adicionar as colunas `audio_url_1` e `audio_url_2`

## Passo 2: Criar Bucket de Storage

### Via Dashboard:
1. No Supabase Dashboard, vá para **Storage**
2. Clique em **"New bucket"**
3. Nome: `exercise-audios`
4. Marque **"Public bucket"** (para acesso direto aos áudios)
5. Clique em **"Create bucket"**

### Configurar Políticas de Storage:
```sql
-- Permitir leitura pública dos áudios
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-audios');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exercise-audios');
```

## Passo 3: Fazer Upload dos Arquivos MP4

### Opção A: Via Dashboard (Manual)
1. Vá para **Storage** → **exercise-audios**
2. Clique em **"Upload file"**
3. Selecione seus arquivos MP4
4. Os arquivos serão armazenados com URLs públicas

### Opção B: Via Código (Programático)
```typescript
import { supabase } from '@/lib/supabaseClient';

async function uploadAudio(file: File, exerciseId: string) {
  // Upload do arquivo
  const fileName = `${exerciseId}_${Date.now()}.mp4`;
  const { data, error } = await supabase.storage
    .from('exercise-audios')
    .upload(fileName, file, {
      contentType: 'audio/mp4',
      upsert: false
    });

  if (error) {
    console.error('Erro no upload:', error);
    return null;
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('exercise-audios')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

## Passo 4: Atualizar a Tabela com as URLs

### Via SQL Editor:
```sql
-- Atualizar exercício específico com URLs dos áudios
UPDATE exercises 
SET 
  audio_url_1 = 'https://avkamxzyqjyrmfikkpkz.supabase.co/storage/v1/object/public/exercise-audios/audio1.mp4',
  audio_url_2 = 'https://avkamxzyqjyrmfikkpkz.supabase.co/storage/v1/object/public/exercise-audios/audio2.mp4'
WHERE id = 'SEU_EXERCISE_ID_AQUI';
```

### Via Código:
```typescript
async function updateExerciseAudios(exerciseId: string, audioUrl1: string, audioUrl2: string) {
  const { data, error } = await supabase
    .from('exercises')
    .update({
      audio_url_1: audioUrl1,
      audio_url_2: audioUrl2
    })
    .eq('id', exerciseId);

  return { data, error };
}
```

## Passo 5: Usar os Áudios na Aplicação

```typescript
// Buscar exercício com áudios
const { data: exercise } = await supabase
  .from('exercises')
  .select('*')
  .eq('id', exerciseId)
  .single();

// Reproduzir áudio
if (exercise?.audio_url_1) {
  const audio = new Audio(exercise.audio_url_1);
  audio.play();
}
```

## Exemplo Completo: Upload e Atualização

```typescript
async function addAudiosToExercise(exerciseId: string, file1: File, file2: File) {
  // 1. Upload dos arquivos
  const url1 = await uploadAudio(file1, exerciseId);
  const url2 = await uploadAudio(file2, exerciseId);

  if (!url1 || !url2) {
    throw new Error('Erro no upload dos áudios');
  }

  // 2. Atualizar tabela
  const { error } = await supabase
    .from('exercises')
    .update({
      audio_url_1: url1,
      audio_url_2: url2
    })
    .eq('id', exerciseId);

  if (error) {
    throw error;
  }

  console.log('Áudios adicionados com sucesso!');
}
```

## Formato das URLs

As URLs seguem este padrão:
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/exercise-audios/[FILENAME].mp4
```

Para o seu projeto:
```
https://avkamxzyqjyrmfikkpkz.supabase.co/storage/v1/object/public/exercise-audios/exemplo.mp4
```

## Notas Importantes

1. **Tamanho dos Arquivos**: O Supabase Storage tem limite de 50MB por arquivo no plano gratuito
2. **Formatos Suportados**: MP4, M4A, MP3, WAV, etc.
3. **Segurança**: Se os áudios forem privados, não marque o bucket como público e use URLs assinadas
4. **Performance**: Considere usar CDN para melhor performance na entrega dos áudios

## Troubleshooting

### Erro: "Bucket not found"
- Certifique-se de que criou o bucket `exercise-audios`

### Erro: "Permission denied"
- Verifique as políticas de RLS no Storage
- Certifique-se de que o usuário está autenticado

### URLs não funcionam
- Verifique se o bucket está marcado como público
- Teste a URL diretamente no navegador
