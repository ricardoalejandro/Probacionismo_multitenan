'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const MODULES = [
  { key: 'students', label: 'Estudiantes' },
  { key: 'courses', label: 'Cursos' },
  { key: 'instructors', label: 'Instructores' },
  { key: 'groups', label: 'Grupos' },
  { key: 'attendance', label: 'Asistencia' },
  { key: 'counseling', label: 'Asesorías' },
  { key: 'enrollments', label: 'Inscripciones' },
];

const PERMISSIONS = [
  { key: 'canView', label: 'Ver' },
  { key: 'canCreate', label: 'Crear' },
  { key: 'canEdit', label: 'Editar' },
  { key: 'canDelete', label: 'Eliminar' },
];

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: any;
  onSave: (data: any) => void;
}

export function RoleFormDialog({ open, onOpenChange, role, onSave }: RoleFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<any>({});

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      // Cargar permisos existentes del rol
    } else {
      setName('');
      setDescription('');
      const defaultPerms: any = {};
      MODULES.forEach(mod => {
        defaultPerms[mod.key] = {
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        };
      });
      setPermissions(defaultPerms);
    }
  }, [role, open]);

  const handlePermissionChange = (module: string, perm: string, checked: boolean) => {
    setPermissions({
      ...permissions,
      [module]: {
        ...permissions[module],
        [perm]: checked,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const permissionsArray = Object.entries(permissions).map(([module, perms]: any) => ({
      module,
      ...perms,
    }));
    onSave({ name, description, permissions: permissionsArray });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Coordinador, Asistente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del rol"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-11">Permisos por Módulo</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-3">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sm">Módulo</th>
                    {PERMISSIONS.map(p => (
                      <th key={p.key} className="text-center p-3 font-semibold text-sm">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(module => (
                    <tr key={module.key} className="border-t">
                      <td className="p-3 font-medium">{module.label}</td>
                      {PERMISSIONS.map(perm => (
                        <td key={perm.key} className="text-center p-3">
                          <Checkbox
                            checked={permissions[module.key]?.[perm.key] || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.key, perm.key, checked as boolean)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-accent-9 hover:bg-accent-10">
              {role ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
