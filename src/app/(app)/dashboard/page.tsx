"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Wifi, Clock, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuardianStore } from '@/hooks/use-guardian-store';
import { useAppSettingsStore } from '@/hooks/use-app-settings-store';
import { Badge } from "@/components/ui/badge";
import { BlockingOverlay } from '@/components/core/blocking-overlay';
import { MonitoringStatus } from '@/components/core/monitoring-status';

export default function DashboardPage() {
  const { blockedAttempts, guardianEmail } = useGuardianStore();
  const { strictModeEnabled, monitoringEnabled } = useAppSettingsStore();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    sessionDetections: 0,
    lastDetectionTime: null as Date | null,
    uptime: 0
  });

  useEffect(() => {
    const startTime = Date.now();
    
    // Update uptime every minute
    const uptimeInterval = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTime) / 60000)
      }));
    }, 60000);

    // Listen for content blocked events
    const handleContentBlocked = (event: any) => {
      setSessionStats(prev => ({
        ...prev,
        sessionDetections: prev.sessionDetections + 1,
        lastDetectionTime: new Date()
      }));
      setIsOverlayOpen(true);
    };

    window.addEventListener('contentBlocked', handleContentBlocked);

    return () => {
      clearInterval(uptimeInterval);
      window.removeEventListener('contentBlocked', handleContentBlocked);
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
        <Badge variant={monitoringEnabled ? "default" : "secondary"} className="text-sm">
          {monitoringEnabled ? "Protección Activa" : "Protección Pausada"}
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detecciones Totales</CardTitle>
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{blockedAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contenido inapropiado detectado y bloqueado.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Sesión</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{sessionStats.sessionDetections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Detecciones en los últimos {sessionStats.uptime} minutos.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guardián Asignado</CardTitle>
            <Mail className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-accent truncate">{guardianEmail || "No establecido"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recibe todas las alertas de seguridad.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modo Estricto</CardTitle>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-orange-600">
              {strictModeEnabled ? "ACTIVADO" : "DESACTIVADO"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {strictModeEnabled ? "Dispositivo se apagará ante detección." : "Solo se enviarán alertas."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MonitoringStatus />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-6 w-6 text-blue-500" />
              Configuración de Alertas
            </CardTitle>
            <CardDescription>
              Sistema de notificaciones al guardián configurado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Detección de Contenido Visual</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Monitoreo de Palabras Clave</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Desconexión Internet (24h)</span>
                <Badge variant="default">Configurado</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Intento de Desinstalación</span>
                <Badge variant="default">Configurado</Badge>
              </div>
            </div>
            
            {sessionStats.lastDetectionTime && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Última detección: {sessionStats.lastDetectionTime.toLocaleTimeString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BlockingOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </div>
  );
}