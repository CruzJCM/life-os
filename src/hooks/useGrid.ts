import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { GridLayout, GridLayouts } from '../types';

const STORAGE_KEY = 'life-os-grid-layouts';
const GRID_SYNC_RETRY_MS = 1500;
const GRID_SYNC_MAX_RETRIES = 3;

const defaultLayouts: GridLayouts = {
  lg: [], md: [], sm: [], xs: [], xxs: [],
};

const serializeLayouts = (value: GridLayouts) => JSON.stringify(value);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWithRetry = async <T,>(operation: () => Promise<T>, maxRetries = GRID_SYNC_MAX_RETRIES): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await sleep(400 * 2 ** attempt);
      }
    }
  }

  throw lastError;
};

export function useGrid() {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<GridLayouts>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          lg:  Array.isArray(parsed.lg)  ? parsed.lg  : [],
          md:  Array.isArray(parsed.md)  ? parsed.md  : [],
          sm:  Array.isArray(parsed.sm)  ? parsed.sm  : [],
          xs:  Array.isArray(parsed.xs)  ? parsed.xs  : [],
          xxs: Array.isArray(parsed.xxs) ? parsed.xxs : [],
        };
      }
    } catch { /* ignore */ }
    return defaultLayouts;
  });

  const hasLoadedFromServer = useRef(false);
  const lastSyncedLayoutsRef = useRef<string>('');

  // Persist to localStorage on every change (instant, no risk of loss on tab close)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts]);

  // Save to Supabase — no debounce needed because CardGrid's isDraggingRef
  // ensures this fires only once per drag/resize stop, not on every pixel
  const syncWithServer = useCallback(async (layoutsToSync: GridLayouts) => {
    if (!user) return;

    const serialized = serializeLayouts(layoutsToSync);
    if (serialized === lastSyncedLayoutsRef.current) return;

    const previousSerialized = lastSyncedLayoutsRef.current;
    lastSyncedLayoutsRef.current = serialized;

    try {
      const { error } = await runWithRetry(async () => {
        return await supabase
          .from('profiles')
          .update({ grid_layouts: layoutsToSync })
          .eq('id', user.id);
      });
      if (error) throw error;
    } catch (err) {
      lastSyncedLayoutsRef.current = previousSerialized;
      console.error('Error syncing grid layouts:', err);
      setTimeout(() => {
        void syncWithServer(layoutsToSync);
      }, GRID_SYNC_RETRY_MS);
    }
  }, [user]);

  // Load from server on login (one-time, server is source of truth)
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
          const remote = data.grid_layouts as GridLayouts;
          const normalizedLayouts = {
            lg:  Array.isArray(remote.lg)  ? remote.lg  : [],
            md:  Array.isArray(remote.md)  ? remote.md  : [],
            sm:  Array.isArray(remote.sm)  ? remote.sm  : [],
            xs:  Array.isArray(remote.xs)  ? remote.xs  : [],
            xxs: Array.isArray(remote.xxs) ? remote.xxs : [],
          };
          setLayouts(normalizedLayouts);
          lastSyncedLayoutsRef.current = serializeLayouts(normalizedLayouts);
        }
      } catch (err) {
        console.error('Error loading grid layouts:', err);
      } finally {
        hasLoadedFromServer.current = true;
      }
    };

    loadFromServer();
  }, [user]);

  // Called by CardGrid after drag/resize stop (guarded by isDraggingRef inside CardGrid)
  const handleLayoutChange = useCallback(
    (_layout: GridLayout[], allLayouts: { [key: string]: GridLayout[] }) => {
      const newLayouts: GridLayouts = {
        lg:  allLayouts.lg  || [],
        md:  allLayouts.md  || [],
        sm:  allLayouts.sm  || [],
        xs:  allLayouts.xs  || [],
        xxs: allLayouts.xxs || [],
      };

      setLayouts((prev) => {
        if (serializeLayouts(prev) === serializeLayouts(newLayouts)) {
          return prev;
        }
        return newLayouts;
      });
      syncWithServer(newLayouts); // immediate — no debounce
    },
    [syncWithServer]
  );

  const updateLayout = useCallback(
    (breakpoint: keyof GridLayouts, layout: GridLayout[]) => {
      setLayouts((prev) => ({ ...prev, [breakpoint]: layout }));
    },
    []
  );

  const getCardLayout = useCallback(
    (cardId: string, breakpoint: keyof GridLayouts = 'lg'): GridLayout | undefined => {
      return layouts[breakpoint]?.find((l) => l.i === cardId);
    },
    [layouts]
  );

  const resetLayouts = useCallback(() => setLayouts(defaultLayouts), []);

  return { layouts, updateLayout, handleLayoutChange, getCardLayout, resetLayouts, syncWithServer };
}