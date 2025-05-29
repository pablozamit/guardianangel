"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useGuardianStore } from '@/hooks/use-guardian-store';
import { useAppSettingsStore } from '@/hooks/use-app-settings-store';
import { Mail, Settings, ShieldAlert, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const { guardianEmail, isGuardianSet: isGuardianStoreInitialized } = useGuardianStore();
  const { 
    strictModeEnabled, 
    toggleStrictMode, 
    monitoringEnabled, 
    toggleMonitoring, 
    isInitialized: isAppSettingsInitialized 
  } = useAppSettingsStore();

  if (!isGuardianStoreInitialized || !isAppSettingsInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Configuración</h1>
      
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-6 w-6 text-primary" />
              Información del Guardián
            </CardTitle>
            <CardDescription>
              Este correo se usa para notificaciones y no se puede cambiar después de la instalación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="guardianEmail" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Correo Electrónico del Guardián
              </Label>
              <Input 
                id="guardianEmail" 
                type="email" 
                value={guardianEmail || "Cargando..."} 
                readOnly 
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Todas las alertas se envían automáticamente a esta dirección.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-6 w-6 text-primary" />
              Configuración del Sistema
            </CardTitle>
            <CardDescription>
              Controla el comportamiento del sistema de protección.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="monitoring" className="text-base">Sistema de Monitoreo</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita o deshabilita el monitoreo de pantalla y teclado.
                </p>
              </div>
              <Switch
                id="monitoring"
                checked={monitoringEnabled}
                onCheckedChange={toggleMonitoring}
                aria-label="Alternar sistema de monitoreo"
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 border-orange-200">
              <div className="space-y-0.5">
                <Label htmlFor="strictMode" className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Modo Estricto
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cuando se activa, el dispositivo se apagará automáticamente al detectar contenido inapropiado.
                </p>
              </div>
              <Switch
                id="strictMode"
                checked={strictModeEnabled}
                onCheckedChange={toggleStrictMode}
                aria-label="Alternar modo estricto"
              />
            </div>

            {strictModeEnabled && (
              <Alert className="border-orange-200 bg-orange-50">
                <ShieldAlert className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Modo Estricto Activado:</strong> El dispositivo se apagará inmediatamente cuando se detecte contenido inapropiado. 
                  Se enviará una alerta al guardián antes del apagado.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Configuración de Monitoreo
            </CardTitle>
            <CardDescription>
              Parámetros del sistema de detección (solo lectura).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Frecuencia de Análisis:</Label>
                <p className="text-muted-foreground">Cada 1 minuto</p>
              </div>
              <div>
                <Label className="font-medium">Sensibilidad:</Label>
                <p className="text-muted-foreground">Agresiva</p>
              </div>
              <div>
                <Label className="font-medium">Umbral de Desconexión:</Label>
                <p className="text-muted-foreground">24 horas</p>
              </div>
              <div>
                <Label className="font-medium">Modo de Operación:</Label>
                <p className="text-muted-foreground">Invisible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}