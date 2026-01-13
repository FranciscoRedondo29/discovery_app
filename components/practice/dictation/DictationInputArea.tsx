import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface DictationInputAreaProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export function DictationInputArea({ value, onChange, disabled }: DictationInputAreaProps) {
    return (
        <Card className="border-2 border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg">Escreve o que ouviste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Escreve aqui o que ouviste..."
                    disabled={disabled}
                    className="min-h-[200px] text-xl resize-none"
                    style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                <p className="text-sm text-text-primary/60">
                    Escreve a frase completa que ouviste. Depois clica em &quot;Corrigir&quot;.
                </p>
            </CardContent>
        </Card>
    );
}