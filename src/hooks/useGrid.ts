import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { GridLayout, GridLayouts } from '../types';

const STORAGE_KEY = 'life-os-grid-layouts';

// Default layouts for different breakpoints
const defaultLayouts: GridLayouts = {
  lg: [],
  md: [],
  sm: [],
  xs: [],
  xxs: [],
};

export function useGrid() {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<GridLayouts>(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore errors
    }
    return defaultLayouts;
  });

  // Save to localStorage whenever layouts change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts]);

  // Sync with Supabase when user is logged in
  const syncWithServer = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ grid_layouts: layouts })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error syncing grid layouts:', err);
    }
  }, [user, layouts]);

  // Load layouts from server on mount
  useEffect(() => {
    if (!user) return;

    const loadFromServer = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('grid_layouts')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.grid_layouts) {
          setLayouts(data.grid_layouts as GridLayouts);
        }
      } catch (err) {
        console.error('Error loading grid layouts:', err);
      }
    };

    loadFromServer();
  }, [user]);

  // Update layout for a specific breakpoint
  const updateLayout = useCallback(
    (breakpoint: keyof GridLayouts, layout: GridLayout[]) => {
      setLayouts((prev) => ({
        ...prev,
        [breakpoint]: layout,
      }));
    },
    []
  );

  // Handle layout change from react-grid-layout
  const handleLayoutChange = useCallback(
    (layout: GridLayout[], layouts: { [key: string]: GridLayout[] }) => {
      setLayouts({
        lg: layouts.lg || [],
        md: layouts.md || [],
        sm: layouts.sm || [],
        xs: layouts.xs || [],
        xxs: layouts.xxs || [],
      });
    },
    []
  );

  // Get layout for a specific card
  const getCardLayout = useCallback(
    (cardId: string, breakpoint: keyof GridLayouts = 'lg'): GridLayout | undefined => {
      return layouts[breakpoint]?.find((l) => l.i === cardId);
    },
    [layouts]
  );

  // Reset layouts to default
  const resetLayouts = useCallback(() => {
    setLayouts(defaultLayouts);
  }, []);

  return {
    layouts,
    updateLayout,
    handleLayoutChange,
    getCardLayout,
    resetLayouts,
    syncWithServer,
  };
}