import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'dark'; // Dark por defecto
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

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

  // Set theme and sync with profile
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    updateTheme(newTheme);

    // Sync with Supabase if user is logged in
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
  }, [updateTheme]);

  // Initialize theme on mount
  useEffect(() => {
    updateTheme(theme);

    // Load theme from profile if logged in
    const loadProfileTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single();

          if (profile?.theme) {
            setThemeState(profile.theme as Theme);
            updateTheme(profile.theme as Theme);
          }
        }
      } catch {
        // Use localStorage theme as fallback
      }
    };

    loadProfileTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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