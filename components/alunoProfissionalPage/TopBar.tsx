"use client";

import { Button } from "@/components/ui/button";
import { Home, LogOut, LucideIcon } from "lucide-react";
import InboxButton from "./InboxButton";
import LinkByEmailInline from "@/components/linking/LinkByEmailInline";

interface TopBarProps {
  userName: string;
  userId: string;
  userEmail: string;
  userType: "aluno" | "profissional";
  showAddForm: boolean;
  homeButtonText?: string;
  homeButtonIcon?: LucideIcon;
  onHomeClick: () => void;
  onLogoutClick: () => void;
  onInboxClick: () => void;
  onToggleAddForm: () => void;
}

export default function TopBar({
  userName,
  userId,
  userEmail,
  userType,
  showAddForm,
  homeButtonText = "Início",
  homeButtonIcon: HomeButtonIcon = Home,
  onHomeClick,
  onLogoutClick,
  onInboxClick,
  onToggleAddForm,
}: TopBarProps) {
  const addButtonLabel = userType === "aluno" ? "Adicionar profissional" : "Adicionar aluno";
  const linkMode = userType === "aluno" ? "aluno" : "profissional";
  const linkLabelDesktop =
    userType === "aluno" ? "Adicionar profissional responsável" : "Adicionar aluno";
  const linkLabelMobile = userType === "aluno" ? "Adicionar prof." : "Adicionar";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="container mx-auto max-w-7xl">
        <div>
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={onHomeClick}
                variant="outline"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                aria-label="Voltar para início"
              >
                <HomeButtonIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{homeButtonText}</span>
              </Button>

              <Button
                onClick={onLogoutClick}
                variant="outline"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                aria-label="Terminar sessão"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Logout
              </Button>

              <InboxButton userId={userId} onClick={onInboxClick} />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary">Olá, {userName}!</h1>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={onToggleAddForm}
                variant="outline"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                aria-label={addButtonLabel}
              >
                {addButtonLabel}
              </Button>
            </div>
          </div>

          {/* Full-width form area under header row */}
          <div className="mt-4 w-full">
            <LinkByEmailInline
              mode={linkMode}
              currentUserId={userId}
              currentUserEmail={userEmail}
              buttonLabelDesktop={linkLabelDesktop}
              buttonLabelMobile={linkLabelMobile}
              hideToggleButton
              showForm={showAddForm}
              onToggle={onToggleAddForm}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
