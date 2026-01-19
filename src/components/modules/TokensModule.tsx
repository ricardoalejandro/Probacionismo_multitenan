'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, Save, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function TokensModule() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configured, setConfigured] = useState(false);
    const [maskedToken, setMaskedToken] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    const [dniToken, setDniToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const response = await api.getTokensConfig();
            setConfigured(response.configured);
            setMaskedToken(response.token);
            setUpdatedAt(response.updatedAt);
        } catch (error) {
            console.error('Error loading tokens config:', error);
            toast.error('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!dniToken.trim()) {
            toast.error('Ingrese un token válido');
            return;
        }

        try {
            setSaving(true);
            await api.saveTokensConfig({ dniToken: dniToken.trim() });
            toast.success('Token guardado correctamente');
            setDniToken('');
            loadConfig();
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al guardar el token';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-accent-9"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent-2 p-3">
                        <Key className="h-6 w-6 text-accent-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Configuración de Tokens</h1>
                        <p className="text-gray-500 mt-1">
                            Configure los tokens de acceso para servicios externos
                        </p>
                    </div>
                </div>
            </div>

            {/* Token de consulta DNI */}
            <Card className="bg-white border-gray-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Token de Consulta de DNI</CardTitle>
                                <CardDescription>
                                    Token para validar datos de DNI con la API de RENIEC
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={configured ? 'success' : 'secondary'} className="flex items-center gap-1">
                            {configured ? (
                                <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    Configurado
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3" />
                                    No configurado
                                </>
                            )}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Estado actual */}
                    {configured && maskedToken && (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Token actual:</p>
                                    <p className="font-mono text-sm mt-1">{maskedToken}</p>
                                </div>
                                {updatedAt && (
                                    <p className="text-xs text-gray-500">
                                        Actualizado: {new Date(updatedAt).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Formulario para nuevo token */}
                    <div className="space-y-3">
                        <Label htmlFor="dniToken">
                            {configured ? 'Actualizar token' : 'Ingresar token'}
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="dniToken"
                                    type={showToken ? 'text' : 'password'}
                                    value={dniToken}
                                    onChange={(e) => setDniToken(e.target.value)}
                                    placeholder="Ingrese el token de acceso"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !dniToken.trim()}
                                className="bg-accent-9 hover:bg-accent-10"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Este token se utiliza para consultar datos de DNI desde la API externa.
                            Manténgalo seguro y no lo comparta.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">¿Para qué sirve este token?</p>
                            <p className="text-blue-700">
                                Al crear un nuevo probacionista con tipo de documento DNI, el sistema puede
                                consultar automáticamente los datos (nombres y apellidos) desde el registro
                                de RENIEC, evitando errores de digitación y asegurando datos verificados.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
