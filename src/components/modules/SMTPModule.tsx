'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, TestTube, Mail } from 'lucide-react';

export function SMTPModule() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [config, setConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    from: { name: '', address: '' },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.getSMTPConfig();
      setConfigured(res.configured);
      if (res.config) {
        setConfig(res.config);
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const res = await api.testSMTPConnection();
      if (res.success) {
        toast.success('✅ Conexión exitosa al servidor SMTP');
      } else {
        toast.error(`❌ ${res.message}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al probar conexión');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.saveSMTPConfig(config);
      toast.success('Configuración guardada correctamente');
      setConfigured(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-9 mx-auto"></div>
          <p className="mt-4 text-neutral-10">Cargando configuración...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-accent-9" />
          Configuración SMTP
        </CardTitle>
        <CardDescription>
          Configura el servidor de correo para enviar notificaciones y reseteos de contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host SMTP *</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Puerto *</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="secure"
              checked={config.secure}
              onCheckedChange={(checked) => setConfig({ ...config, secure: checked })}
            />
            <Label htmlFor="secure">Usar SSL/TLS (puerto 465)</Label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">Email Usuario *</Label>
              <Input
                id="user"
                type="email"
                value={config.auth.user}
                onChange={(e) => setConfig({ ...config, auth: { ...config.auth, user: e.target.value } })}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña *</Label>
              <Input
                id="pass"
                type="password"
                value={config.auth.pass}
                onChange={(e) => setConfig({ ...config, auth: { ...config.auth, pass: e.target.value } })}
                placeholder={configured ? '••••••••' : 'Contraseña o App Password'}
                required={!configured}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">Nombre Remitente *</Label>
              <Input
                id="fromName"
                value={config.from.name}
                onChange={(e) => setConfig({ ...config, from: { ...config.from, name: e.target.value } })}
                placeholder="Sistema Escolástica"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromAddress">Email Remitente *</Label>
              <Input
                id="fromAddress"
                type="email"
                value={config.from.address}
                onChange={(e) => setConfig({ ...config, from: { ...config.from, address: e.target.value } })}
                placeholder="noreply@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing || !config.host || !config.auth.user}
              className="flex-1"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent-9 hover:bg-accent-10"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
