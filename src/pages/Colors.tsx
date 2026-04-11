import { Header, MainLayout } from '../components/layout';
import {
  COLOR_PRESETS,
  GRID_BACKGROUND_PRESETS,
  type ColorPreset,
  type GridBackgroundPreset,
  useTheme,
} from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';
import { cn } from '../lib/utils';

export function Colors() {
  const {
    colorPreset,
    setColorPreset,
    resolvedTheme,
    colorMode,
    setColorMode,
    colorIntensity,
    setColorIntensity,
    customColors,
    setCustomColor,
    gridBackgroundMode,
    setGridBackgroundMode,
    gridBackgroundPreset,
    setGridBackgroundPreset,
    gridBackgroundBlur,
    setGridBackgroundBlur,
    gridBackgroundImage,
    setGridBackgroundImage,
  } = useTheme();

  const intensityOptions = [
    { value: 'soft' as const, label: 'Suave' },
    { value: 'medium' as const, label: 'Medio' },
    { value: 'strong' as const, label: 'Fuerte' },
  ];

  return (
    <MainLayout>
      <Header title="Colores" />
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="card-base p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personaliza tu estilo
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Elige una paleta para cambiar el color del menú izquierdo y los acentos globales
              como el botón de agregar tarjetas y elementos destacados.
            </p>

            <div className="space-y-5 mb-6">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Modo de personalización</p>
                <div className="inline-flex p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setColorMode('preset')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      colorMode === 'preset'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('custom')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      colorMode === 'custom'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    Avanzado
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Intensidad</p>
                <div className="flex gap-2">
                  {intensityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColorIntensity(option.value)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm border transition-colors',
                        colorIntensity === option.value
                          ? 'border-transparent bg-[var(--accent-primary)] text-white'
                          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {colorMode === 'custom' && (
              <div className="mb-6 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">Ajuste manual de colores</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'accentPrimary', label: 'Acento principal' },
                    { key: 'accentSecondary', label: 'Acento secundario' },
                    { key: 'sidebarLightBg', label: 'Menú claro' },
                    { key: 'sidebarDarkBg', label: 'Menú oscuro' },
                  ].map(({ key, label }) => {
                    const typedKey = key as keyof typeof customColors;
                    const value = customColors[typedKey];

                    return (
                      <label key={key} className="space-y-1.5 block">
                        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setCustomColor(typedKey, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-[var(--border-color)] bg-transparent p-0 cursor-pointer"
                          />
                          <span className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)]">
                            {value.toUpperCase()}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(COLOR_PRESETS) as Array<[ColorPreset, (typeof COLOR_PRESETS)[ColorPreset]]>).map(
                ([presetKey, preset]) => {
                  const isActive = colorPreset === presetKey && colorMode === 'preset';
                  const sidebar = preset.sidebar[resolvedTheme];

                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => setColorPreset(presetKey)}
                      className={cn(
                        'text-left p-4 rounded-2xl border transition-all',
                        isActive
                          ? 'border-transparent ring-2 ring-[var(--accent-primary)] bg-[var(--bg-tertiary)]'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{preset.label}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{preset.description}</p>
                        </div>
                        {isActive && (
                          <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-primary)] text-white">
                            Activo
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-[var(--text-secondary)] mb-1">Acento</p>
                          <div className="flex gap-2">
                            <span className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: preset.accentPrimary }} />
                            <span className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: preset.accentSecondary }} />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-[var(--text-secondary)] mb-1">Menú lateral</p>
                          <div className="flex gap-2">
                            <span className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: sidebar.bg }} />
                            <span className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: sidebar.hoverBg }} />
                            <span className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: sidebar.activeBg }} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          <section className="card-base p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Fondo principal
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Personaliza el fondo de toda el área de contenido (debajo del header y a la derecha del menú)
              con presets abstractos o una imagen de tu dispositivo.
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Fuente del fondo</p>
                <div className="inline-flex p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setGridBackgroundMode('preset')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      gridBackgroundMode === 'preset'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridBackgroundMode('image')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      gridBackgroundMode === 'image'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    Imagen local
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Blur del fondo</p>
                  <span className="text-xs text-[var(--text-tertiary)]">{gridBackgroundBlur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={gridBackgroundBlur}
                  onChange={(e) => setGridBackgroundBlur(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-primary)]"
                />
              </div>

              {gridBackgroundMode === 'preset' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.entries(GRID_BACKGROUND_PRESETS) as Array<[
                    GridBackgroundPreset,
                    (typeof GRID_BACKGROUND_PRESETS)[GridBackgroundPreset]
                  ]>).map(([presetKey, preset]) => {
                    const active = gridBackgroundPreset === presetKey;
                    return (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => setGridBackgroundPreset(presetKey)}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-colors',
                          active
                            ? 'border-transparent ring-2 ring-[var(--accent-primary)] bg-[var(--bg-tertiary)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                        )}
                      >
                        <p className="font-medium text-[var(--text-primary)] text-sm">{preset.label}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">{preset.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {gridBackgroundMode === 'image' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Seleccionar imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setGridBackgroundImage(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[var(--accent-primary)] file:text-white"
                  />
                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <span>{gridBackgroundImage ? 'Imagen cargada correctamente' : 'No hay imagen seleccionada'}</span>
                    {gridBackgroundImage && (
                      <button
                        type="button"
                        onClick={() => setGridBackgroundImage(null)}
                        className="text-[var(--accent-rose)] hover:opacity-80"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
