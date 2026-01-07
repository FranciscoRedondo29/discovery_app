import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const filename = formData.get('filename') as string;

    if (!audioFile || !filename) {
      return NextResponse.json(
        { error: 'Missing audio file or filename' },
        { status: 400 }
      );
    }

    // Create gravacoes directory if it doesn't exist
    const gravacoesDir = join(process.cwd(), 'gravacoes');
    if (!existsSync(gravacoesDir)) {
      await mkdir(gravacoesDir, { recursive: true });
    }

    // Convert blob to buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const filepath = join(gravacoesDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      path: filepath,
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json(
      { error: 'Failed to save recording' },
      { status: 500 }
    );
  }
}
