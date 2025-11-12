'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-neutral-2 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="rounded-full bg-accent-9 p-4 inline-block mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-11 mb-2">Cambiar Contraseña</h1>
          <p className="text-neutral-9">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🚧 Funcionalidad en Desarrollo</CardTitle>
            <CardDescription>
              El sistema de cambio de contraseña está siendo implementado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {token && (
              <div className="bg-neutral-3 p-3 rounded mb-4">
                <p className="text-xs text-neutral-10 font-mono break-all">
                  Token: {token.substring(0, 20)}...
                </p>
              </div>
            )}
            <p className="text-sm text-neutral-10 mb-4">
              Funcionalidades previstas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-10 mb-6">
              <li>Validar token de reseteo</li>
              <li>Verificar que no haya expirado (1 hora)</li>
              <li>Confirmar nueva contraseña</li>
              <li>Actualizar contraseña de forma segura</li>
              <li>Marcar token como usado</li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
