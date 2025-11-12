'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CounselingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counseling: any;
  studentId: string;
  onSave: (data: any) => void;
}

export function CounselingFormDialog({ open, onOpenChange, counseling, studentId, onSave }: CounselingFormDialogProps) {
  const [formData, setFormData] = useState({
    instructorId: '',
    branchId: '',
    groupName: '',
    groupCode: '',
    counselingDate: '',
    indicator: 'tibio' as 'frio' | 'tibio' | 'caliente',
    observations: '',
  });
  const [instructors, setInstructors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
      if (counseling) {
        setFormData({
          instructorId: counseling.instructorId || '',
          branchId: counseling.branchId || '',
          groupName: counseling.groupName || '',
          groupCode: counseling.groupCode || '',
          counselingDate: counseling.counselingDate?.split('T')[0] || '',
          indicator: counseling.indicator || 'tibio',
          observations: counseling.observations || '',
        });
      } else {
        setFormData({
          instructorId: '',
          branchId: '',
          groupName: '',
          groupCode: '',
          counselingDate: new Date().toISOString().split('T')[0],
          indicator: 'tibio',
          observations: '',
        });
      }
    }
  }, [counseling, open]);

  const loadData = async () => {
    try {
      const branchId = localStorage.getItem('selected_branch') || '';
      const [instructorsRes, branchesRes] = await Promise.all([
        api.getInstructors(branchId),
        api.getBranches(),
      ]);
      setInstructors(instructorsRes.data || []);
      setBranches(branchesRes.data || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{counseling ? 'Editar Asesoría' : 'Nueva Asesoría Filosófica'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Sede *</Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Nombre del Grupo *</Label>
              <Input
                id="groupName"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                required
                placeholder="Ej: Grupo A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupCode">Código del Grupo</Label>
              <Input
                id="groupCode"
                value={formData.groupCode}
                onChange={(e) => setFormData({ ...formData, groupCode: e.target.value })}
                placeholder="Ej: GRP-001"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Asesoría *</Label>
              <Input
                id="date"
                type="date"
                value={formData.counselingDate}
                onChange={(e) => setFormData({ ...formData, counselingDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicator">Indicador *</Label>
              <Select
                value={formData.indicator}
                onValueChange={(value: any) => setFormData({ ...formData, indicator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frio">❄️ Frío</SelectItem>
                  <SelectItem value="tibio">😐 Tibio</SelectItem>
                  <SelectItem value="caliente">🔥 Caliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones *</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              required
              rows={4}
              placeholder="Describe el comportamiento y progreso del estudiante..."
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-accent-9 hover:bg-accent-10">
              {counseling ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
