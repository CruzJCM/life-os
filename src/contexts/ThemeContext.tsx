import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark' | 'system';
export type ColorPreset = 'classic' | 'ocean' | 'sunset' | 'forest' | 'rose' | 'mono';
export type ColorMode = 'preset' | 'custom';
export type ColorIntensity = 'soft' | 'medium' | 'strong';
export type GridBackgroundMode = 'preset' | 'image';
export type GridBackgroundPreset =
  | 'none'
  | 'theme-mist'
  | 'mesh'
  | 'ripple'
  | 'sunrise'
  | 'midnight';

interface CustomColors {
  accentPrimary: string;
  accentSecondary: string;
  sidebarLightBg: string;
  sidebarDarkBg: string;
}

interface GridBackgroundSettings {
  version: 1;
  mode: GridBackgroundMode;
  preset: GridBackgroundPreset;
  blur: number;
  imageDataUrl: string | null;
}

interface StoredColorSettings {
  version: 1;
  preset: ColorPreset;
  mode: ColorMode;
  intensity: ColorIntensity;
  custom: CustomColors;
}

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  accentPrimary: '#007aff',
  accentSecondary: '#5856d6',
  sidebarLightBg: '#f5f5f7',
  sidebarDarkBg: '#1c1c1e',
};

const DEFAULT_COLOR_SETTINGS: StoredColorSettings = {
  version: 1,
  preset: 'classic',
  mode: 'preset',
  intensity: 'medium',
  custom: DEFAULT_CUSTOM_COLORS,
};

const DEFAULT_GRID_BACKGROUND_SETTINGS: GridBackgroundSettings = {
  version: 1,
  mode: 'preset',
  preset: 'theme-mist',
  blur: 12,
  imageDataUrl: null,
};

interface ColorPresetDefinition {
  label: string;
  description: string;
  accentPrimary: string;
  accentSecondary: string;
  sidebar: {
    light: {
      bg: string;
      hoverBg: string;
      activeBg: string;
      borderColor: string;
    };
    dark: {
      bg: string;
      hoverBg: string;
      activeBg: string;
      borderColor: string;
    };
  };
}

export const COLOR_PRESETS: Record<ColorPreset, ColorPresetDefinition> = {
  classic: {
    label: 'Clásico',
    description: 'El estilo original de Life OS, renovado',
    accentPrimary: '#007aff',
    accentSecondary: '#5856d6',
    sidebar: {
      light: {
        bg: '#f5f5f7',
        hoverBg: '#ececf1',
        activeBg: '#e3e3ea',
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
      dark: {
        bg: '#1c1c1e',
        hoverBg: '#2b2b2d',
        activeBg: '#37373a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  ocean: {
    label: 'Océano',
    description: 'Azules limpios con menú profundo',
    accentPrimary: '#0a84ff',
    accentSecondary: '#4f46e5',
    sidebar: {
      light: {
        bg: '#dfe8f5',
        hoverBg: '#d2dff1',
        activeBg: '#c4d5ed',
        borderColor: 'rgba(30, 64, 175, 0.2)',
      },
      dark: {
        bg: '#121a29',
        hoverBg: '#182338',
        activeBg: '#1f2d45',
        borderColor: 'rgba(96, 165, 250, 0.24)',
      },
    },
  },
  sunset: {
    label: 'Atardecer',
    description: 'Naranjas cálidos y contraste suave',
    accentPrimary: '#ff6f3c',
    accentSecondary: '#ef4444',
    sidebar: {
      light: {
        bg: '#f4e3d8',
        hoverBg: '#eed7c7',
        activeBg: '#e8cbb6',
        borderColor: 'rgba(154, 52, 18, 0.2)',
      },
      dark: {
        bg: '#251811',
        hoverBg: '#311f15',
        activeBg: '#3d2719',
        borderColor: 'rgba(251, 146, 60, 0.24)',
      },
    },
  },
  forest: {
    label: 'Bosque',
    description: 'Verdes sobrios para foco prolongado',
    accentPrimary: '#22a06b',
    accentSecondary: '#15803d',
    sidebar: {
      light: {
        bg: '#dde9df',
        hoverBg: '#d1e1d4',
        activeBg: '#c3d9c8',
        borderColor: 'rgba(22, 101, 52, 0.2)',
      },
      dark: {
        bg: '#142018',
        hoverBg: '#1a2a20',
        activeBg: '#223428',
        borderColor: 'rgba(74, 222, 128, 0.24)',
      },
    },
  },
  rose: {
    label: 'Rosa Eléctrico',
    description: 'Acentos vibrantes y look creativo',
    accentPrimary: '#e11d74',
    accentSecondary: '#c026d3',
    sidebar: {
      light: {
        bg: '#f3dfe6',
        hoverBg: '#edd2dd',
        activeBg: '#e8c4d3',
        borderColor: 'rgba(157, 23, 77, 0.2)',
      },
      dark: {
        bg: '#24131d',
        hoverBg: '#301726',
        activeBg: '#3b1d30',
        borderColor: 'rgba(244, 114, 182, 0.24)',
      },
    },
  },
  mono: {
    label: 'Monocromo',
    description: 'Neutral elegante, menos distracciones',
    accentPrimary: '#3f3f46',
    accentSecondary: '#18181b',
    sidebar: {
      light: {
        bg: '#e7e7e8',
        hoverBg: '#dedee0',
        activeBg: '#d4d4d8',
        borderColor: 'rgba(39, 39, 42, 0.2)',
      },
      dark: {
        bg: '#17171a',
        hoverBg: '#1f1f23',
        activeBg: '#27272d',
        borderColor: 'rgba(161, 161, 170, 0.24)',
      },
    },
  },
};

const COLOR_PRESET_STORAGE_KEY = 'color-preset';
const COLOR_SETTINGS_STORAGE_KEY = 'color-settings-v1';
const COLOR_SETTINGS_METADATA_KEY = 'life_os_color_settings';
const GRID_BACKGROUND_STORAGE_KEY = 'grid-bg-settings-v1';

export const GRID_BACKGROUND_PRESETS: Record<
  GridBackgroundPreset,
  { label: string; description: string }
> = {
  none: {
    label: 'Sin fondo',
    description: 'Superficie limpia y minimalista',
  },
  'theme-mist': {
    label: 'Bruma temática',
    description: 'Ondas suaves con acentos del tema',
  },
  mesh: {
    label: 'Malla abstracta',
    description: 'Capas geométricas difuminadas',
  },
  ripple: {
    label: 'Ondas',
    description: 'Ritmo circular minimalista',
  },
  sunrise: {
    label: 'Amanecer',
    description: 'Gradiente cálido con volumen suave',
  },
  midnight: {
    label: 'Medianoche',
    description: 'Profundo y elegante para oscuro',
  },
};

const toRgbString = (hex: string) => {
  const raw = hex.replace('#', '');
  const normalized = raw.length === 3
    ? raw
        .split('')
        .map((c) => c + c)
        .join('')
    : raw;

  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const raw = normalized.length === 3
    ? normalized
        .split('')
        .map((c) => c + c)
        .join('')
    : normalized;

  const parsed = parseInt(raw, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;

  switch (max) {
    case rn:
      h = ((gn - bn) / d) % 6;
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
      break;
  }

  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = ln - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h >= 0 && h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
};

const adjustColor = (hex: string, saturationMultiplier: number, lightnessDelta: number) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const nextS = clamp(hsl.s * saturationMultiplier, 0, 100);
  const nextL = clamp(hsl.l + lightnessDelta, 0, 100);
  const nextRgb = hslToRgb(hsl.h, nextS, nextL);
  return rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildGridBackground = (
  preset: GridBackgroundPreset,
  accentPrimary: string,
  accentSecondary: string,
  mode: 'light' | 'dark'
) => {
  const a1 = hexToRgba(accentPrimary, mode === 'dark' ? 0.34 : 0.26);
  const a2 = hexToRgba(accentSecondary, mode === 'dark' ? 0.26 : 0.2);

  switch (preset) {
    case 'none':
      return 'none';
    case 'theme-mist':
      return `
        radial-gradient(circle at 12% 18%, ${a1} 0%, transparent 38%),
        radial-gradient(circle at 84% 24%, ${a2} 0%, transparent 42%),
        linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))
      `;
    case 'mesh':
      return `
        linear-gradient(120deg, ${hexToRgba(accentPrimary, mode === 'dark' ? 0.2 : 0.14)} 0%, transparent 45%),
        linear-gradient(320deg, ${hexToRgba(accentSecondary, mode === 'dark' ? 0.24 : 0.16)} 0%, transparent 52%),
        radial-gradient(circle at 50% 60%, rgba(255,255,255,0.08), transparent 65%)
      `;
    case 'ripple':
      return `
        radial-gradient(circle at 50% 50%, transparent 0 18%, ${hexToRgba(accentPrimary, mode === 'dark' ? 0.12 : 0.1)} 18% 24%, transparent 24% 34%, ${hexToRgba(accentSecondary, mode === 'dark' ? 0.14 : 0.12)} 34% 40%, transparent 40% 58%),
        linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.18))
      `;
    case 'sunrise':
      return `
        radial-gradient(circle at 20% 80%, rgba(255, 166, 0, ${mode === 'dark' ? 0.22 : 0.2}) 0%, transparent 46%),
        radial-gradient(circle at 85% 12%, ${hexToRgba(accentSecondary, mode === 'dark' ? 0.24 : 0.18)} 0%, transparent 48%),
        linear-gradient(145deg, ${hexToRgba(accentPrimary, mode === 'dark' ? 0.16 : 0.12)} 0%, rgba(255,255,255,0.02) 68%)
      `;
    case 'midnight':
      return `
        radial-gradient(circle at 14% 14%, ${hexToRgba('#60a5fa', mode === 'dark' ? 0.18 : 0.12)} 0%, transparent 35%),
        radial-gradient(circle at 84% 84%, ${hexToRgba('#7c3aed', mode === 'dark' ? 0.2 : 0.14)} 0%, transparent 38%),
        linear-gradient(180deg, rgba(5, 8, 20, ${mode === 'dark' ? 0.55 : 0.2}), rgba(5, 8, 20, ${mode === 'dark' ? 0.25 : 0.06}))
      `;
    default:
      return 'none';
  }
};

const intensityTokens = {
  soft: { saturation: 0.82, accentLightness: 4, sidebarOffset: 3 },
  medium: { saturation: 1, accentLightness: 0, sidebarOffset: 0 },
  strong: { saturation: 1.18, accentLightness: -2, sidebarOffset: -3 },
} as const;

const isValidHex = (value: unknown): value is string =>
  typeof value === 'string' && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(value);

const normalizeColorSettings = (input: unknown): StoredColorSettings => {
  if (!input || typeof input !== 'object') return DEFAULT_COLOR_SETTINGS;

  const raw = input as Partial<StoredColorSettings> & { custom?: Partial<CustomColors> };

  const preset = raw.preset && raw.preset in COLOR_PRESETS
    ? raw.preset
    : DEFAULT_COLOR_SETTINGS.preset;

  const mode = raw.mode === 'custom' ? 'custom' : 'preset';
  const intensity = raw.intensity && raw.intensity in intensityTokens
    ? raw.intensity
    : DEFAULT_COLOR_SETTINGS.intensity;

  return {
    version: 1,
    preset,
    mode,
    intensity,
    custom: {
      accentPrimary: isValidHex(raw.custom?.accentPrimary)
        ? raw.custom!.accentPrimary!
        : DEFAULT_CUSTOM_COLORS.accentPrimary,
      accentSecondary: isValidHex(raw.custom?.accentSecondary)
        ? raw.custom!.accentSecondary!
        : DEFAULT_CUSTOM_COLORS.accentSecondary,
      sidebarLightBg: isValidHex(raw.custom?.sidebarLightBg)
        ? raw.custom!.sidebarLightBg!
        : DEFAULT_CUSTOM_COLORS.sidebarLightBg,
      sidebarDarkBg: isValidHex(raw.custom?.sidebarDarkBg)
        ? raw.custom!.sidebarDarkBg!
        : DEFAULT_CUSTOM_COLORS.sidebarDarkBg,
    },
  };
};

const normalizeGridBackgroundSettings = (input: unknown): GridBackgroundSettings => {
  if (!input || typeof input !== 'object') return DEFAULT_GRID_BACKGROUND_SETTINGS;
  const raw = input as Partial<GridBackgroundSettings>;

  const mode: GridBackgroundMode = raw.mode === 'image' ? 'image' : 'preset';
  const preset: GridBackgroundPreset =
    raw.preset && raw.preset in GRID_BACKGROUND_PRESETS
      ? raw.preset
      : DEFAULT_GRID_BACKGROUND_SETTINGS.preset;

  return {
    version: 1,
    mode,
    preset,
    blur: typeof raw.blur === 'number' ? clamp(raw.blur, 0, 40) : DEFAULT_GRID_BACKGROUND_SETTINGS.blur,
    imageDataUrl: typeof raw.imageDataUrl === 'string' ? raw.imageDataUrl : null,
  };
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  colorPreset: ColorPreset;
  setColorPreset: (preset: ColorPreset) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  colorIntensity: ColorIntensity;
  setColorIntensity: (intensity: ColorIntensity) => void;
  customColors: CustomColors;
  setCustomColor: (key: keyof CustomColors, value: string) => void;
  currentAccentColor: string;
  gridBackgroundMode: GridBackgroundMode;
  setGridBackgroundMode: (mode: GridBackgroundMode) => void;
  gridBackgroundPreset: GridBackgroundPreset;
  setGridBackgroundPreset: (preset: GridBackgroundPreset) => void;
  gridBackgroundBlur: number;
  setGridBackgroundBlur: (blur: number) => void;
  gridBackgroundImage: string | null;
  setGridBackgroundImage: (imageDataUrl: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'dark'; // Dark por defecto
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [currentAccentColor, setCurrentAccentColor] = useState<string>(
    DEFAULT_COLOR_SETTINGS.mode === 'custom'
      ? DEFAULT_COLOR_SETTINGS.custom.accentPrimary
      : COLOR_PRESETS[DEFAULT_COLOR_SETTINGS.preset].accentPrimary
  );
  const [gridBackgroundSettings, setGridBackgroundSettings] = useState<GridBackgroundSettings>(() => {
    const stored = localStorage.getItem(GRID_BACKGROUND_STORAGE_KEY);
    if (!stored) return DEFAULT_GRID_BACKGROUND_SETTINGS;
    try {
      return normalizeGridBackgroundSettings(JSON.parse(stored));
    } catch {
      return DEFAULT_GRID_BACKGROUND_SETTINGS;
    }
  });
  const [colorSettings, setColorSettings] = useState<StoredColorSettings>(() => {
    const stored = localStorage.getItem(COLOR_SETTINGS_STORAGE_KEY) || localStorage.getItem(COLOR_PRESET_STORAGE_KEY);
    if (!stored) return DEFAULT_COLOR_SETTINGS;

    try {
      // Backward compatibility: old storage kept only the preset string.
      if (!stored.trim().startsWith('{')) {
        const legacyPreset = stored as ColorPreset;
        if (legacyPreset in COLOR_PRESETS) {
          return { ...DEFAULT_COLOR_SETTINGS, preset: legacyPreset };
        }
      }

      return normalizeColorSettings(JSON.parse(stored));
    } catch {
      return DEFAULT_COLOR_SETTINGS;
    }
  });

  const hasLoadedProfileThemeRef = useRef(false);
  const hasLoadedRemoteColorsRef = useRef(false);
  const hasStoredTheme = typeof window !== 'undefined' && !!localStorage.getItem('theme');
  const hasStoredColorSettings =
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(COLOR_SETTINGS_STORAGE_KEY) || !!localStorage.getItem(COLOR_PRESET_STORAGE_KEY));

  // Update DOM and persist theme
  const updateTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;

    let resolved: 'light' | 'dark';

    if (newTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolved = newTheme;
    }

    setResolvedTheme(resolved);
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('theme', newTheme);
  }, []);

  const applyColorPreset = useCallback((settings: StoredColorSettings, mode: 'light' | 'dark') => {
    const root = document.documentElement;
    const intensity = intensityTokens[settings.intensity];

    const baseAccentPrimary = settings.mode === 'custom'
      ? settings.custom.accentPrimary
      : COLOR_PRESETS[settings.preset].accentPrimary;

    const baseAccentSecondary = settings.mode === 'custom'
      ? settings.custom.accentSecondary
      : COLOR_PRESETS[settings.preset].accentSecondary;

    const accentLightness = mode === 'dark'
      ? intensity.accentLightness + 2
      : intensity.accentLightness;

    const accentPrimary = adjustColor(baseAccentPrimary, intensity.saturation, accentLightness);
    const accentSecondary = adjustColor(baseAccentSecondary, intensity.saturation, accentLightness);

    const baseSidebar = settings.mode === 'custom'
      ? mode === 'dark'
        ? settings.custom.sidebarDarkBg
        : settings.custom.sidebarLightBg
      : COLOR_PRESETS[settings.preset].sidebar[mode].bg;

    const sidebarBg = adjustColor(baseSidebar, intensity.saturation, intensity.sidebarOffset);
    const sidebarHoverBg = adjustColor(sidebarBg, intensity.saturation, mode === 'dark' ? 6 : -4);
    const sidebarActiveBg = adjustColor(sidebarBg, intensity.saturation, mode === 'dark' ? 12 : -8);
    const sidebarBorderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)';

    root.style.setProperty('--accent-primary', accentPrimary);
    root.style.setProperty('--accent-secondary', accentSecondary);
    root.style.setProperty('--accent-primary-rgb', toRgbString(accentPrimary));
    setCurrentAccentColor(accentPrimary);

    root.style.setProperty('--sidebar-bg', sidebarBg);
    root.style.setProperty('--sidebar-hover-bg', sidebarHoverBg);
    root.style.setProperty('--sidebar-active-bg', sidebarActiveBg);
    root.style.setProperty('--sidebar-border-color', sidebarBorderColor);
  }, []);

  // Set theme and sync with profile
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);

    // Sync with Supabase in background; local UI is source of truth.
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ theme: newTheme })
            .eq('id', user.id);
        }
      } catch {
        // Silently fail - localStorage is the source of truth
      }
    })();
  }, []);

  // Always apply when theme state changes.
  useEffect(() => {
    updateTheme(theme);
  }, [theme, updateTheme]);

  useEffect(() => {
    applyColorPreset(colorSettings, resolvedTheme);
    localStorage.setItem(COLOR_SETTINGS_STORAGE_KEY, JSON.stringify(colorSettings));
    localStorage.removeItem(COLOR_PRESET_STORAGE_KEY);
  }, [colorSettings, resolvedTheme, applyColorPreset]);

  useEffect(() => {
    const root = document.documentElement;
    const blurPx = `${gridBackgroundSettings.blur}px`;
    const image =
      gridBackgroundSettings.mode === 'image' && gridBackgroundSettings.imageDataUrl
        ? `url("${gridBackgroundSettings.imageDataUrl}")`
        : buildGridBackground(
            gridBackgroundSettings.preset,
            currentAccentColor,
            adjustColor(currentAccentColor, 1.06, resolvedTheme === 'dark' ? -6 : -2),
            resolvedTheme
          );

    root.style.setProperty('--grid-bg-image', image);
    root.style.setProperty('--grid-bg-blur', blurPx);
    root.style.setProperty('--grid-bg-size', gridBackgroundSettings.mode === 'image' ? '100vw auto' : '140% 140%');
    root.style.setProperty('--grid-bg-position', gridBackgroundSettings.mode === 'image' ? 'center top' : 'center');
    root.style.setProperty('--grid-bg-repeat', 'no-repeat');
    root.style.setProperty('--grid-bg-attachment', gridBackgroundSettings.mode === 'image' ? 'fixed' : 'scroll');
    root.style.setProperty('--grid-bg-opacity', gridBackgroundSettings.mode === 'image' ? '0.9' : '1');
    root.style.setProperty('--grid-bg-transform', gridBackgroundSettings.mode === 'image' ? 'none' : 'scale(1.08)');

    localStorage.setItem(GRID_BACKGROUND_STORAGE_KEY, JSON.stringify(gridBackgroundSettings));
  }, [gridBackgroundSettings, currentAccentColor, resolvedTheme]);

  const syncColorSettingsToSupabase = useCallback(async (settings: StoredColorSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const current = normalizeColorSettings(userMetadata[COLOR_SETTINGS_METADATA_KEY]);

      if (JSON.stringify(current) === JSON.stringify(settings)) return;

      await supabase.auth.updateUser({
        data: {
          ...userMetadata,
          [COLOR_SETTINGS_METADATA_KEY]: settings,
        },
      });
    } catch {
      // Silent fail: local storage is still source of truth.
    }
  }, []);

  useEffect(() => {
    void syncColorSettingsToSupabase(colorSettings);
  }, [colorSettings, syncColorSettingsToSupabase]);

  const setColorPreset = useCallback((preset: ColorPreset) => {
    setColorSettings((prev) => ({ ...prev, preset, mode: 'preset' }));
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorSettings((prev) => ({ ...prev, mode }));
  }, []);

  const setColorIntensity = useCallback((intensity: ColorIntensity) => {
    setColorSettings((prev) => ({ ...prev, intensity }));
  }, []);

  const setCustomColor = useCallback((key: keyof CustomColors, value: string) => {
    if (!isValidHex(value)) return;
    setColorSettings((prev) => ({
      ...prev,
      mode: 'custom',
      custom: {
        ...prev.custom,
        [key]: value,
      },
    }));
  }, []);

  const setGridBackgroundMode = useCallback((mode: GridBackgroundMode) => {
    setGridBackgroundSettings((prev) => ({ ...prev, mode }));
  }, []);

  const setGridBackgroundPreset = useCallback((preset: GridBackgroundPreset) => {
    setGridBackgroundSettings((prev) => ({ ...prev, mode: 'preset', preset }));
  }, []);

  const setGridBackgroundBlur = useCallback((blur: number) => {
    setGridBackgroundSettings((prev) => ({ ...prev, blur: clamp(blur, 0, 40) }));
  }, []);

  const setGridBackgroundImage = useCallback((imageDataUrl: string | null) => {
    setGridBackgroundSettings((prev) => ({
      ...prev,
      mode: imageDataUrl ? 'image' : 'preset',
      imageDataUrl,
    }));
  }, []);

  // Load profile theme once on mount, but do not override explicit local preference.
  useEffect(() => {
    if (hasLoadedProfileThemeRef.current) return;
    hasLoadedProfileThemeRef.current = true;

    const loadProfileTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single();

          if (profile?.theme && !hasStoredTheme) {
            setThemeState(profile.theme as Theme);
          }
        }
      } catch {
        // Use localStorage theme as fallback
      }
    };

    void loadProfileTheme();
  }, [hasStoredTheme]);

  useEffect(() => {
    if (hasLoadedRemoteColorsRef.current) return;
    hasLoadedRemoteColorsRef.current = true;

    if (hasStoredColorSettings) return;

    const loadRemoteColorSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
        const remote = normalizeColorSettings(metadata[COLOR_SETTINGS_METADATA_KEY]);
        setColorSettings(remote);
      } catch {
        // Silent fallback to defaults/local.
      }
    };

    void loadRemoteColorSettings();
  }, [hasStoredColorSettings]);

  // Listen for system theme changes only while in "system" mode.
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      updateTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        colorPreset: colorSettings.preset,
        setColorPreset,
        colorMode: colorSettings.mode,
        setColorMode,
        colorIntensity: colorSettings.intensity,
        setColorIntensity,
        customColors: colorSettings.custom,
        setCustomColor,
        currentAccentColor,
        gridBackgroundMode: gridBackgroundSettings.mode,
        setGridBackgroundMode,
        gridBackgroundPreset: gridBackgroundSettings.preset,
        setGridBackgroundPreset,
        gridBackgroundBlur: gridBackgroundSettings.blur,
        setGridBackgroundBlur,
        gridBackgroundImage: gridBackgroundSettings.imageDataUrl,
        setGridBackgroundImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}