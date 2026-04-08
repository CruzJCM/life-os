import { useState, useEffect } from 'react';
import { Header, MainLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Monitor, User, Mail, Calendar, LogOut, Trash2, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button, Input } from '../components/ui';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const themes = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({ display_name: displayName });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <MainLayout>
      <Header title="Ajustes" />
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Section */}
          <section className="card-base p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil
            </h2>

            <div className="space-y-4">
              {/* Avatar placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {profile?.display_name || 'Usuario'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
                </div>
              </div>

              {/* Display name */}
              <Input
                label="Nombre para mostrar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
              />

              {/* Email (readonly) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>

              {/* Member since */}
              {profile?.created_at && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro desde {formatDate(profile.created_at)}</span>
                </div>
              )}

              {/* Save button */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  disabled={displayName === profile?.display_name}
                >
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </Button>

                {message && (
                  <span
                    className={cn(
                      'text-sm',
                      message.type === 'success' ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-rose)]'
                    )}
                  >
                    {message.text}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="card-base p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Apariencia
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-3 block">
                  Tema
                </label>
                <div className="flex gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all',
                        'border border-[var(--border-color)]',
                        theme === t.value
                          ? 'bg-[var(--accent-primary)] text-white border-transparent'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      )}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="card-base p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Cuenta
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Gestiona tu sesión y datos de cuenta
              </p>

              {/* Sign out button */}
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>

              {/* Danger zone */}
              <div className="pt-4 border-t border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-tertiary)] mb-3">
                  Zona de peligro: estas acciones son irreversibles
                </p>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                      // TODO: Implement account deletion
                      alert('Funcionalidad en desarrollo');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </section>

          {/* App Info */}
          <div className="text-center text-sm text-[var(--text-tertiary)]">
            <p>Life OS v3</p>
            <p className="text-xs mt-1">Hecho con ❤️ para organizar tu vida</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}