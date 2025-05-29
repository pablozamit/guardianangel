"use client";

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Wifi, Shield, AlertTriangle } from "lucide-react";

interface MonitoringStatusProps {
  className?: string;
}

export function MonitoringStatus({ className }: MonitoringStatusProps) {
  const [status, setStatus] = useState({
    screenMonitoring: false,
    keyboardMonitoring: false,
    internetConnected: navigator.onLine,
    lastCheckTime: new Date().toLocaleTimeString(),
    alertsCount: 0
  });

  useEffect(() => {
    // Initialize monitoring status
    setStatus(prev => ({
      ...prev,
      screenMonitoring: true,
      keyboardMonitoring: true,
      internetConnected: navigator.onLine
    }));

    // Update status every minute
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        internetConnected: navigator.onLine,
        lastCheckTime: new Date().toLocaleTimeString()
      }));
    }, 60000);

    // Listen for network changes
    const handleOnline = () => setStatus(prev => ({ ...prev, internetConnected: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, internetConnected: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for content blocked events
    const handleContentBlocked = (event: any) => {
      setStatus(prev => ({
        ...prev,
        alertsCount: prev.alertsCount + 1
      }));
    };

    window.addEventListener('contentBlocked', handleContentBlocked);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('contentBlocked', handleContentBlocked);
    };
  }, []);

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-green-500" />
          Estado del Sistema de Monitoreo
        </CardTitle>
        <CardDescription>
          Servicios de protección en tiempo real activos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Análisis de Pantalla
          </span>
          <Badge variant={status.screenMonitoring ? "default" : "destructive"}>
            {status.screenMonitoring ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoreo de Teclado
          </span>
          <Badge variant={status.keyboardMonitoring ? "default" : "destructive"}>
            {status.keyboardMonitoring ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Conexión a Internet
          </span>
          <Badge variant={status.internetConnected ? "default" : "destructive"}>
            {status.internetConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
        {status.alertsCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Detecciones en esta sesión
            </span>
            <Badge variant="destructive">
              {status.alertsCount}
            </Badge>
          </div>
        )}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Última verificación: {status.lastCheckTime}
        </div>
      </CardContent>
    </Card>
  );
}