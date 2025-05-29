
"use client";

import { Shield } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const { clearGuardianData } = useGuardianStore();
  const router = useRouter();

  const handleLogout = () => {
    clearGuardianData();
    router.push('/'); 
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-primary">Ángel Guardián</h1>
      </div>
      <div className="ml-auto">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Reiniciar y Salir
        </Button>
      </div>
    </header>
  );
}
