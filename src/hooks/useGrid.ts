import { useState, useCallback, useEffect, useRef } from 'react';
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
    // Load from localStorage on init for immediate display
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Guarantee all breakpoint keys exist to avoid undefined errors
        return {
          lg:  Array.isArray(parsed.lg)  ? parsed.lg  : [],
          md:  Array.isArray(parsed.md)  ? parsed.md  : [],
          sm:  Array.isArray(parsed.sm)  ? parsed.sm  : [],
          xs:  Array.isArray(parsed.xs)  ? parsed.xs  : [],
          xxs: Array.isArray(parsed.xxs) ? parsed.xxs : [],
        };
      }
    } catch {
      // Ignore errors
    }
    return defaultLayouts;
  });

  // Track if we've loaded from server to avoid overwriting
  const hasLoadedFromServer = useRef(false);
  // Debounce timer for server sync
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save to localStorage immediately for responsive UX
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts]);

  // Debounced sync with Supabase - only sync after user stops dragging
  const syncWithServer = useCallback(async (layoutsToSync: GridLayouts) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ grid_layouts: layoutsToSync })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error syncing grid layouts:', err);
    }
  }, [user]);

  // Load layouts from server on mount (one-time)
  useEffect(() => {
    if (!user || hasLoadedFromServer.current) return;

    const loadFromServer = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('grid_layouts')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.grid_layouts) {
          hasLoadedFromServer.current = true;
          setLayouts(data.grid_layouts as GridLayouts);
        }
      } catch (err) {
        console.error('Error loading grid layouts:', err);
      }
    };

    loadFromServer();
  }, [user]);

  // Handle layout change with debounced server sync
  const handleLayoutChange = useCallback(
    (_layout: GridLayout[], allLayouts: { [key: string]: GridLayout[] }) => {
      const newLayouts: GridLayouts = {
        lg: allLayouts.lg || [],
        md: allLayouts.md || [],
        sm: allLayouts.sm || [],
        xs: allLayouts.xs || [],
        xxs: allLayouts.xxs || [],
      };

      setLayouts(newLayouts);

      // Debounce server sync - wait 500ms after last change
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncWithServer(newLayouts);
      }, 500);
    },
    [syncWithServer]
  );

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
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