
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { useGuardianStore } from "@/hooks/use-guardian-store"; // Import type

const formSchema = z.object({
  guardianEmail: z.string().trim().email({ message: "Dirección de correo electrónico inválida." }),
  confirmGuardianEmail: z.string().trim().email({ message: "Dirección de correo electrónico inválida." }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
}).refine(data => data.guardianEmail === data.confirmGuardianEmail, {
  message: "Los correos electrónicos del guardián no coinciden.",
  path: ["confirmGuardianEmail"],
});

type GuardianSetupFormProps = {
  onSetupComplete: (email: string) => void;
};

export function GuardianSetupForm({ onSetupComplete }: GuardianSetupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guardianEmail: "",
      confirmGuardianEmail: "",
      termsAccepted: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSetupComplete(values.guardianEmail);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-3xl font-bold">Configuración de Ángel Guardián</CardTitle>
          <CardDescription>
            Configura tu guardián para recibir alertas y mantener tu navegación segura. Este correo no se podrá cambiar después.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guardianEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo del Guardián</FormLabel>
                    <FormControl>
                      <Input placeholder="guardian@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmGuardianEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Correo del Guardián</FormLabel>
                    <FormControl>
                      <Input placeholder="guardian@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto los <a href="#" className="text-primary hover:underline">términos y condiciones</a>.
                      </FormLabel>
                      <FormDescription>
                        Esta es una aplicación de demostración. No se realizará ninguna monitorización de pantalla ni envío de correos reales.
                      </FormDescription>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg">
                Establecer Guardián y Comenzar a Proteger
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
