# 🎯 Guía de Finalización Manual - Mejoras UX (10% Restante)

## ✅ Estado Actual (90% Completado)

**BACKEND**: 100% ✅
- ✅ Migración ejecutada: `code_number`, `address`, indexes
- ✅ Schema actualizado: `codeNumber` en branches
- ✅ API Students: Zod validation (DNI 8 dígitos), paginación, `address`, `email`/`phone` opcionales
- ✅ API Branches: auto-generación `FIL-001`, `FIL-002`, etc.
- ✅ APIs (Courses, Instructors, Groups): paginación con `page`, `limit`, `search`

**COMPONENTES UI**: 100% ✅
- ✅ `/src/components/ui/responsive-dialog.tsx` - Modal maximizable
- ✅ `/src/components/ui/data-table-pagination.tsx` - Controles de paginación

**SIDEBAR**: 100% ✅
- ✅ `/src/app/workspace/page.tsx` - Collapsible con localStorage

---

## 🔧 Tareas Pendientes (10%)

### 1️⃣ **StudentsModule.tsx** (15-20 min) ⚡ PRIORIDAD
### 2️⃣ **CoursesModule.tsx** (10 min)
### 3️⃣ **InstructorsModule.tsx** (10 min)
### 4️⃣ **GroupsModule.tsx** (10 min)

---

## 📝 TAREA 1: StudentsModule.tsx (DETALLADO)

**Archivo**: `/src/components/modules/StudentsModule.tsx`

### Paso 1: Actualizar Imports (líneas 1-7)

**REEMPLAZAR**:
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
```

**POR**:
```typescript
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Textarea } from '@/components/ui/textarea';
```

### Paso 2: Añadir Interfaz de Paginación (después de interface Student)

**AÑADIR DESPUÉS DE** `interface Student { ... }`:
```typescript
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Paso 3: Actualizar Estado (líneas ~52-65)

**AÑADIR DESPUÉS DE** `const [formData, setFormData] = useState({...});`:
```typescript
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
```

**Y ACTUALIZAR** `formData` para incluir `address`:
```typescript
  const [formData, setFormData] = useState({
    documentType: 'DNI',
    dni: '',
    gender: 'Masculino',
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    email: '',
    phone: '',
    address: '',  // ⬅️ AÑADIR ESTA LÍNEA
    birthDate: '',
    admissionDate: new Date().toISOString().split('T')[0],
    admissionReason: 'Nuevo',
    status: 'Activo',
    monthlyFee: 0,
  });
```

### Paso 4: Actualizar loadStudents() (línea ~70)

**REEMPLAZAR**:
```typescript
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getStudents({ branchId });
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Error al cargar probacionistas');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
```

**POR**:
```typescript
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getStudents({
        branchId,
        page,
        limit: pageSize,
        search,
      });
      
      if (response.data) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Error al cargar probacionistas', { duration: 1500 });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
```

### Paso 5: Añadir useEffect para Paginación

**AÑADIR DESPUÉS DEL** `useEffect(() => { loadStudents(); }, [branchId]);`:
```typescript
  useEffect(() => {
    loadStudents();
  }, [page, pageSize, search]);
```

### Paso 6: Añadir Funciones de Validación

**AÑADIR ANTES DE** `handleSubmit`:
```typescript
  const handleDniInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 8);
    setFormData({ ...formData, dni: numericValue });
    
    if (formErrors.dni && numericValue.length === 8) {
      setFormErrors({ ...formErrors, dni: '' });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // DNI: debe ser exactamente 8 dígitos
    if (!/^\d{8}$/.test(formData.dni)) {
      errors.dni = 'El DNI debe tener exactamente 8 dígitos';
    }
    
    // Fechas: birthDate < admissionDate
    if (formData.birthDate && formData.admissionDate) {
      const birthDate = new Date(formData.birthDate);
      const admissionDate = new Date(formData.admissionDate);
      
      if (birthDate >= admissionDate) {
        errors.birthDate = 'La fecha de nacimiento debe ser anterior a la fecha de admisión';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
```

### Paso 7: Actualizar handleSubmit (línea ~85)

**REEMPLAZAR** la primera línea de `handleSubmit`:
```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
```

**POR**:
```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario', { duration: 1500 });
      return;
    }
```

**Y ACTUALIZAR LOS TOAST**:
```typescript
        toast.success('Probacionista actualizado', { duration: 1500 });
      } else {
        await api.createStudent({
          ...formData,
          branchId,
        });
        toast.success('Probacionista creado', { duration: 1500 });
```

### Paso 8: Actualizar handleEdit (añadir address)

**EN LA FUNCIÓN** `handleEdit`, **AÑADIR**:
```typescript
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',  // ⬅️ AÑADIR ESTA LÍNEA
      birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
```

### Paso 9: Actualizar handleDelete (toast duration)

**CAMBIAR**:
```typescript
      toast.success('Probacionista eliminado');
```

**POR**:
```typescript
      toast.success('Probacionista eliminado', { duration: 1500 });
```

**Y CAMBIAR**:
```typescript
      toast.error('Error al eliminar');
```

**POR**:
```typescript
      toast.error('Error al eliminar', { duration: 1500 });
```

### Paso 10: Actualizar resetForm (añadir address)

**AÑADIR EN** `resetForm`:
```typescript
      email: '',
      phone: '',
      address: '',  // ⬅️ AÑADIR ESTA LÍNEA
      birthDate: '',
```

### Paso 11: ELIMINAR filteredStudents

**BUSCAR Y ELIMINAR** la constante `filteredStudents` (líneas ~160-172), ya no es necesaria porque el filtrado se hace en el backend.

### Paso 12: Reemplazar Dialog por ResponsiveDialog

**BUSCAR** (línea ~358):
```typescript
      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Editar' : 'Nuevo'} Probacionista
            </DialogTitle>
          </DialogHeader>
```

**REEMPLAZAR POR**:
```typescript
      {/* Dialog */}
      <ResponsiveDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        title={`${editingStudent ? 'Editar' : 'Nuevo'} Probacionista`}
      >
```

### Paso 13: Actualizar Formulario - Campo DNI

**BUSCAR** (línea ~392):
```typescript
                {/* DNI */}
                <div>
                  <Label>Número de Documento</Label>
                  <Input
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    required
                  />
                </div>
```

**REEMPLAZAR POR**:
```typescript
                {/* DNI */}
                <div>
                  <Label>Número de Documento *</Label>
                  <Input
                    value={formData.dni}
                    onChange={(e) => handleDniInput(e.target.value)}
                    placeholder="12345678"
                    maxLength={8}
                    required
                    className={formErrors.dni ? 'border-red-500' : ''}
                  />
                  {formErrors.dni && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.dni}</p>
                  )}
                </div>
```

### Paso 14: Añadir Campo Address

**DESPUÉS DEL CAMPO** "Teléfono" (línea ~465), **AÑADIR**:
```typescript
                {/* Address */}
                <div className="col-span-2">
                  <Label>Dirección</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Dirección completa del probacionista"
                    rows={3}
                  />
                </div>
```

### Paso 15: Actualizar Campo Birth Date con Validación

**BUSCAR** (línea ~470):
```typescript
                {/* Birth Date */}
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
```

**REEMPLAZAR POR**:
```typescript
                {/* Birth Date */}
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData({ ...formData, birthDate: e.target.value });
                      if (formErrors.birthDate) {
                        setFormErrors({ ...formErrors, birthDate: '' });
                      }
                    }}
                    className={formErrors.birthDate ? 'border-red-500' : ''}
                  />
                  {formErrors.birthDate && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.birthDate}</p>
                  )}
                </div>
```

### Paso 16: Cerrar ResponsiveDialog Correctamente

**BUSCAR EL FINAL DEL FORMULARIO** (línea ~530):
```typescript
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
```

**REEMPLAZAR POR**:
```typescript
            </DialogFooter>
          </form>
      </ResponsiveDialog>
```

### Paso 17: Añadir DataTablePagination

**DESPUÉS DE** `</Table>` (dentro del bloque de tabla, línea ~355), **AÑADIR**:
```typescript
          </Table>
          <DataTablePagination
            page={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
```

### Paso 18: Actualizar TableBody

**REEMPLAZAR** (línea ~334):
```typescript
            <TableBody>
              {filteredStudents.map((student) => (
```

**POR**:
```typescript
            <TableBody>
              {students.map((student) => (
```

---

## 📝 TAREA 2: CoursesModule.tsx (SIMPLIFICADO)

**Archivo**: `/src/components/modules/CoursesModule.tsx`

### Cambios Necesarios:

1. **Imports**: Añadir `ResponsiveDialog`, `DataTablePagination`
2. **Estado**: Añadir `page`, `pageSize`, `pagination`
3. **loadCourses()**: Añadir parámetros `page`, `limit`, `search`, actualizar `setPagination(response.pagination)`
4. **useEffect**: Escuchar cambios de `page`, `pageSize`, `search`
5. **Dialog → ResponsiveDialog**: Cambiar componente
6. **Añadir**: `<DataTablePagination />` después de `</Table>`
7. **Toast**: Cambiar duración a `1500` en todos los `toast.success()` y `toast.error()`
8. **Eliminar**: `filteredCourses` (filtrado se hace en backend)

---

## 📝 TAREA 3: InstructorsModule.tsx (SIMPLIFICADO)

Seguir el **mismo patrón** que CoursesModule.tsx:
- Imports, estado, paginación, ResponsiveDialog, DataTablePagination, toast duration 1500ms

---

## 📝 TAREA 4: GroupsModule.tsx (SIMPLIFICADO)

Seguir el **mismo patrón** que CoursesModule.tsx:
- Imports, estado, paginación, ResponsiveDialog, DataTablePagination, toast duration 1500ms

---

## 🧪 CÓMO PROBAR

1. **Iniciar servicios**:
   ```bash
   cd /home/rrojacam/proyectos/escolastica
   ./scripts/start-all.sh
   ```

2. **Abrir navegador**: http://localhost:5000

3. **Probar Probacionistas**:
   - ✅ Crear: DNI 8 dígitos, validar fechas, campo dirección
   - ✅ Maximizar modal con botón superior derecho
   - ✅ Paginación: cambiar tamaño de página (10/25/50/100)
   - ✅ Buscar: filtro en tiempo real
   - ✅ Toast: desaparece en 1.5 segundos

4. **Probar Filiales**:
   - ✅ Crear: código auto-generado (FIL-001, FIL-002)
   - ✅ Código mostrado como readonly

5. **Sidebar**:
   - ✅ Colapsar/expandir con botón Menu
   - ✅ Estado persiste al recargar página

---

## 📊 RESUMEN

| Componente | Cambios | Tiempo |
|------------|---------|--------|
| StudentsModule.tsx | 18 pasos detallados | 15-20 min |
| CoursesModule.tsx | Patrón simplificado | 10 min |
| InstructorsModule.tsx | Patrón simplificado | 10 min |
| GroupsModule.tsx | Patrón simplificado | 10 min |
| **TOTAL** | **4 archivos** | **45-50 min** |

---

## 💡 TIPS

- **Editor**: Usa VS Code con búsqueda (Ctrl+F) para localizar secciones rápidamente
- **Copiar/Pegar**: Ten cuidado con la indentación (usar espacios, no tabs)
- **Guardar Frecuente**: Ctrl+S después de cada cambio
- **Recargar**: El navegador se recarga automáticamente con cada guardado
- **Errores**: Si hay error de compilación, revisa la consola de Next.js (terminal donde corre `npm run dev`)

---

## ✅ CRITERIOS DE ACEPTACIÓN

Al finalizar, debes poder:
- ✅ Crear probacionista con DNI validado (exactamente 8 dígitos)
- ✅ Ver campo "Dirección" en formulario de probacionistas
- ✅ Validar que fecha de nacimiento < fecha de admisión
- ✅ Maximizar/minimizar todos los modals
- ✅ Paginar todas las tablas (10, 25, 50, 100 registros)
- ✅ Ver códigos auto-generados en filiales (FIL-001, FIL-002...)
- ✅ Colapsar sidebar con persistencia
- ✅ Toasts desaparecen en 1.5 segundos

---

## 🆘 AYUDA

Si encuentras problemas:
1. **Error de compilación**: Revisa que los imports sean correctos
2. **Tipos TypeScript**: Asegúrate de que `interface PaginationData` esté definida
3. **API no responde**: Verifica que el backend esté corriendo (`docker ps`)
4. **Datos no aparecen**: Revisa que `loadStudents()` pase los parámetros correctos

---

**Autor**: Arquitecto Full Stack Multi-Tenant  
**Fecha**: 2025-11-08  
**Commit Base**: 089459c - "feat: implementar mejoras UX (90% completo)"
