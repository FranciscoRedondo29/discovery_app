import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface DictationInputAreaProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export function DictationInputArea({ value, onChange, disabled }: DictationInputAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Map of base letter + accent to accented character
    const accentMap: Record<string, Record<string, string>> = {
        'a': { '´': 'á', '`': 'à', '^': 'â', '~': 'ã' },
        'A': { '´': 'Á', '`': 'À', '^': 'Â', '~': 'Ã' },
        'e': { '´': 'é', '`': 'è', '^': 'ê' },
        'E': { '´': 'É', '`': 'È', '^': 'Ê' },
        'i': { '´': 'í', '`': 'ì', '^': 'î' },
        'I': { '´': 'Í', '`': 'Ì', '^': 'Î' },
        'o': { '´': 'ó', '`': 'ò', '^': 'ô', '~': 'õ' },
        'O': { '´': 'Ó', '`': 'Ò', '^': 'Ô', '~': 'Õ' },
        'u': { '´': 'ú', '`': 'ù', '^': 'û' },
        'U': { '´': 'Ú', '`': 'Ù', '^': 'Û' },
        'c': { 'ç': 'ç' },
        'C': { 'ç': 'Ç' },
    };

    // Apply accent to the previous letter
    const applyAccent = (accent: string) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        
        if (cursorPos === 0) {
            // No previous character, just insert the accent mark
            insertCharacter(accent);
            return;
        }
        
        // Get the character before the cursor
        const prevChar = value.charAt(cursorPos - 1);
        
        // Check if we can apply the accent
        if (accentMap[prevChar] && accentMap[prevChar][accent]) {
            // Replace the previous character with the accented version
            const newValue = 
                value.substring(0, cursorPos - 1) + 
                accentMap[prevChar][accent] + 
                value.substring(cursorPos);
            
            onChange(newValue);
            
            // Keep cursor in the same position
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(cursorPos, cursorPos);
            }, 0);
        } else {
            // Can't apply accent to this character, just insert it
            insertCharacter(accent);
        }
    };

    // Insert character at cursor position (for punctuation)
    const insertCharacter = (char: string) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + char + value.substring(end);
        
        onChange(newValue);
        
        // Set cursor position after inserted character
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + char.length, start + char.length);
        }, 0);
    };

    // Accent buttons
    const accentButtons = [
        { label: '´', char: '´', name: 'acento agudo' },
        { label: '`', char: '`', name: 'acento grave' },
        { label: '^', char: '^', name: 'acento circunflexo' },
        { label: '~', char: '~', name: 'til' },
        { label: 'ç', char: 'ç', name: 'cedilha' },
    ];

    const punctuationButtons = [
        { label: '?', char: '?' },
        { label: '!', char: '!' },
        { label: '.', char: '.' },
        { label: ',', char: ',' },
    ];

    return (
        <Card className="border-2 border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg">Escreve o que ouviste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Escreve aqui o que ouviste..."
                    disabled={disabled}
                    className="min-h-[200px] text-5xl resize-none"
                    style={{ 
                        fontFamily: "OpenDyslexic, Arial, sans-serif", 
                        fontSize: "3rem", 
                        lineHeight: "1.2" 
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                {/* Accent and Punctuation Helper Buttons */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary mb-2 text-center">
                            Acentos (clica depois de escrever a letra)
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {accentButtons.map((btn) => (
                                <Button
                                    key={btn.char}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => applyAccent(btn.char)}
                                    disabled={disabled}
                                    className="text-3xl font-bold w-14 h-14 p-0 border-2 border-primary-yellow hover:bg-primary-yellow hover:text-white"
                                    title={btn.name}
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                        {/* Punctuation Buttons */}
                    <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary mb-2 text-center">Pontuação</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {punctuationButtons.map((btn) => (
                                <Button
                                    key={btn.char}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => insertCharacter(btn.char)}
                                    disabled={disabled}
                                    className="text-3xl font-bold w-14 h-14 p-0 border-2 border-primary-yellow hover:bg-primary-yellow hover:text-white"
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-text-primary/60">
                    Escreve a frase completa que ouviste. Para acentuar, escreve a letra e depois clica no acento. Depois clica em &quot;Corrigir&quot;.
                </p>
            </CardContent>
        </Card>
    );
}