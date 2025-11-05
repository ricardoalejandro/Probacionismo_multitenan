'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  BookOpen,
  UserCheck,
  FolderKanban,
  ClipboardCheck,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const modules = [
  { id: 'home', name: 'Inicio', icon: Home },
  { id: 'students', name: 'Probacionistas', icon: Users },
  { id: 'courses', name: 'Cursos', icon: BookOpen },
  { id: 'instructors', name: 'Instructores', icon: UserCheck },
  { id: 'groups', name: 'Grupos', icon: FolderKanban },
  { id: 'attendance', name: 'Asistencia', icon: ClipboardCheck, disabled: true },
];

export default function WorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branchId');
  const [activeModule, setActiveModule] = useState('home');
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchId) {
      router.push('/dashboard');
      return;
    }

    const loadBranch = async () => {
      try {
        const data = await api.me();
        const selectedBranch = data.branches.find((b: any) => b.id === branchId);
        if (selectedBranch) {
          setBranch(selectedBranch);
        } else {
          toast.error('Sucursal no encontrada');
          router.push('/dashboard');
        }
      } catch (error) {
        toast.error('Error al cargar sucursal');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [branchId, router]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('selected_branch');
    toast.success('Sesión cerrada');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-9"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-2">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-6 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-6">
          <h2 className="font-semibold text-lg truncate">{branch?.name}</h2>
          <p className="text-sm text-neutral-10">{branch?.code}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mt-3 w-full justify-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => !module.disabled && setActiveModule(module.id)}
                disabled={module.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${
                    activeModule === module.id
                      ? 'bg-accent-9 text-white'
                      : 'hover:bg-neutral-3 text-neutral-12'
                  }
                  ${module.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{module.name}</span>
                {module.disabled && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Próximamente
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-6">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeModule === 'home' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Bienvenido</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <Users className="h-8 w-8 text-accent-9 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Probacionistas</h3>
                  <p className="text-neutral-10">Gestiona estudiantes y sus datos</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <BookOpen className="h-8 w-8 text-accent-9 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Cursos</h3>
                  <p className="text-neutral-10">Administra cursos y temas</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <UserCheck className="h-8 w-8 text-accent-9 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Instructores</h3>
                  <p className="text-neutral-10">Gestiona el personal docente</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <FolderKanban className="h-8 w-8 text-accent-9 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Grupos</h3>
                  <p className="text-neutral-10">Organiza grupos de clases</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow opacity-50">
                  <ClipboardCheck className="h-8 w-8 text-neutral-9 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Asistencia</h3>
                  <p className="text-neutral-10">Próximamente disponible</p>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'students' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Probacionistas</h1>
              <p className="text-neutral-10 mb-6">
                Gestión completa de estudiantes - En construcción
              </p>
              <div className="bg-white p-8 rounded-lg shadow">
                <p className="text-center text-neutral-10">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'courses' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Cursos</h1>
              <p className="text-neutral-10 mb-6">
                Gestión de cursos y temas - En construcción
              </p>
              <div className="bg-white p-8 rounded-lg shadow">
                <p className="text-center text-neutral-10">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'instructors' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Instructores</h1>
              <p className="text-neutral-10 mb-6">
                Gestión de instructores - En construcción
              </p>
              <div className="bg-white p-8 rounded-lg shadow">
                <p className="text-center text-neutral-10">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'groups' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Grupos de Clases</h1>
              <p className="text-neutral-10 mb-6">
                Gestión de grupos - En construcción
              </p>
              <div className="bg-white p-8 rounded-lg shadow">
                <p className="text-center text-neutral-10">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
