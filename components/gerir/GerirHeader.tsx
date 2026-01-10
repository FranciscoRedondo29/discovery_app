import { Button } from "@/components/ui/button";

interface GerirHeaderProps {
  title: string;
  backRoute: string;
  onBack: () => void;
}

export function GerirHeader({ title, backRoute, onBack }: GerirHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <div>
          <Button variant="ghost" onClick={onBack}>Voltar</Button>
        </div>
      </div>
    </header>
  );
}
