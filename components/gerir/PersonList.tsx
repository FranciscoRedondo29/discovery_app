import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import Link from "next/link";

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
  showProgressButton?: boolean;
}

export function PersonList({
  persons,
  title,
  emptyMessage,
  onRemove,
  renderDetails,
  showProgressButton = false,
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
                {showProgressButton && (
                  <Link href={`/profissional/alunos/${person.id}/progress`}>
                    <Button
                      className="hover:bg-blue-50 hover:text-text-primary text-blue-700 border border-blue-600 bg-transparent"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ver Progresso
                    </Button>
                  </Link>
                )}
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
