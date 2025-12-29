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
}

export default function LinkByEmailInline({
  mode,
  currentUserId,
  currentUserEmail,
  buttonLabelDesktop,
  buttonLabelMobile,
}: LinkByEmailInlineProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  
  const { loading, error, success, linkByEmail, resetState } = useLinkByEmail({
    mode,
    currentUserId,
  });

  // Auto-close form after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setShowForm(false);
        setEmail("");
        resetState();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, resetState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await linkByEmail(email);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEmail("");
    resetState();
  };

  const toggleForm = () => {
    if (!showForm) {
      resetState();
      setEmail("");
    }
    setShowForm(!showForm);
  };

  return (
    <div className="space-y-3">
      {/* Add Button only (user email removed per request) */}
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

      {/* Inline Form (conditionally rendered) */}
      {showForm && (
        <div className="bg-soft-yellow border border-primary-yellow/30 rounded-lg p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Success Message */}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {mode === "aluno" 
                  ? "Profissional adicionado com sucesso!" 
                  : "Aluno adicionado com sucesso!"}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Email Input */}
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

                {/* Action Buttons */}
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

