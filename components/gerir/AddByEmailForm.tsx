import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddByEmailFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  addError: string;
  placeholder: string;
  label: string;
}

export function AddByEmailForm({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
  addError,
  placeholder,
  label,
}: AddByEmailFormProps) {
  return (
    <section className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="flex-1"
          aria-label={placeholder}
        />
        <Button type="submit" disabled={loading} className="bg-primary-yellow">
          {loading ? "A adicionar..." : "Adicionar"}
        </Button>
      </form>
      {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  );
}
