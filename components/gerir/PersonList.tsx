import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Person {
  id: string;
  nome: string;
  email: string;
  [key: string]: any;
}

interface PersonListProps {
  persons: Person[];
  title: string;
  emptyMessage: string;
  onRemove: (id: string) => void;
  renderDetails: (person: Person) => React.ReactNode;
}

export function PersonList({
  persons,
  title,
  emptyMessage,
  onRemove,
  renderDetails,
}: PersonListProps) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">
        {title} ({persons.length})
      </h2>
      {persons.length === 0 ? (
        <div className="text-text-primary/70">{emptyMessage}</div>
      ) : (
        <div className="grid gap-4">
          {persons.map((person) => (
            <div
              key={person.id}
              className="bg-white border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{person.nome}</div>
                <div className="text-sm text-text-primary/70">
                  {renderDetails(person)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="hover:bg-yellow-50 hover:text-text-primary text-yellow-700 border border-yellow-600 bg-transparent"
                  onClick={() => onRemove(person.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
