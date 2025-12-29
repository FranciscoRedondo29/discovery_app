"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useLinkByEmail } from "@/hooks/useLinkByEmail";

interface LinkByEmailInlineProps {
  mode: "aluno" | "profissional";
  currentUserId: string;
  currentUserEmail: string;
  buttonLabelDesktop: string;
  buttonLabelMobile: string;
  showForm?: boolean;
  onToggle?: () => void;
  hideToggleButton?: boolean;
}

export default function LinkByEmailInline({
  mode,
  currentUserId,
  currentUserEmail,
  buttonLabelDesktop,
  buttonLabelMobile,
  showForm: controlledShowForm,
  onToggle,
  hideToggleButton,
}: LinkByEmailInlineProps) {
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [email, setEmail] = useState("");

  const { loading, error, success, linkByEmail, resetState } = useLinkByEmail({
    mode,
    currentUserId,
  });

  // Auto-close form after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        if (typeof controlledShowForm === "undefined") {
          setInternalShowForm(false);
        }
        setEmail("");
        resetState();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, resetState, controlledShowForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await linkByEmail(email);
  };

  const handleCancel = () => {
    if (typeof onToggle === "function") onToggle();
    if (typeof controlledShowForm === "undefined") {
      setInternalShowForm(false);
    }
    setEmail("");
    resetState();
  };

  const toggleForm = () => {
    if (typeof onToggle === "function") {
      onToggle();
      if (typeof controlledShowForm === "undefined") {
        setInternalShowForm((s) => !s);
      }
      return;
    }

    if (!internalShowForm) {
      resetState();
      setEmail("");
    }
    setInternalShowForm((s) => !s);
  };

  const showForm = typeof controlledShowForm === "undefined" ? internalShowForm : controlledShowForm;

  return (
    <div className="space-y-3 w-full">
      {/* Add Button */}
      {!hideToggleButton && (
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleForm}
            variant="outline"
            className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
            aria-label={buttonLabelDesktop}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{buttonLabelDesktop}</span>
            <span className="sm:hidden">{buttonLabelMobile}</span>
          </Button>
        </div>
      )}

      {/* Inline Form (conditionally rendered) */}
      {showForm && (
        <div className="w-full bg-soft-yellow border border-primary-yellow/30 rounded-lg p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                Pedido enviado com sucesso!
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {!success && (
              <>
                <div>
                  <Input
                    type="email"
                    placeholder="Inserir email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full"
                    aria-label={mode === "aluno" ? "Email do profissional" : "Email do aluno"}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                  >
                    {loading ? "A adicionar..." : "Adicionar"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 border-gray-300 text-text-primary hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

