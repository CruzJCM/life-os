import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../lib/utils';

export interface CardCategory {
  id: string;
  name: string;
}

interface StoredCategorySettings {
  categories: CardCategory[];
  groupByCategory: boolean;
}

const defaultSettings: StoredCategorySettings = {
  categories: [],
  groupByCategory: false,
};

const getStorageKey = (userId?: string) =>
  userId ? `daimon-card-categories:${userId}` : 'daimon-card-categories:guest';

const getLegacyStorageKey = (userId?: string) =>
  userId ? `life-os-card-categories:${userId}` : 'life-os-card-categories:guest';

const normalize = (raw: unknown): StoredCategorySettings => {
  if (!raw || typeof raw !== 'object') return defaultSettings;
  const candidate = raw as Partial<StoredCategorySettings>;

  const categories = Array.isArray(candidate.categories)
    ? candidate.categories
        .filter((item): item is CardCategory => {
          if (!item || typeof item !== 'object') return false;
          const i = item as Partial<CardCategory>;
          return typeof i.id === 'string' && typeof i.name === 'string' && i.name.trim().length > 0;
        })
        .map((item) => ({ ...item, name: item.name.trim() }))
    : [];

  return {
    categories,
    groupByCategory: candidate.groupByCategory === true,
  };
};

export function useCardCategories() {
  const { user } = useAuth();

  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);

  const [settings, setSettings] = useState<StoredCategorySettings>(() => {
    try {
      let stored = localStorage.getItem(storageKey);
      if (!stored) {
        const legacyKey = getLegacyStorageKey(user?.id);
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
          localStorage.setItem(storageKey, legacy);
          localStorage.removeItem(legacyKey);
          stored = legacy;
        }
      }
      if (!stored) return defaultSettings;
      return normalize(JSON.parse(stored));
    } catch {
      return defaultSettings;
    }
  });

  const persist = useCallback((next: StoredCategorySettings) => {
    setSettings(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [storageKey]);

  const createCategory = useCallback((name: string): string | null => {
    const clean = name.trim();
    if (!clean) return null;

    const existing = settings.categories.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;

    const category: CardCategory = {
      id: generateId(),
      name: clean,
    };

    persist({
      ...settings,
      categories: [...settings.categories, category],
    });

    return category.id;
  }, [settings, persist]);

  const deleteCategory = useCallback((id: string) => {
    persist({
      ...settings,
      categories: settings.categories.filter((c) => c.id !== id),
    });
  }, [settings, persist]);

  const moveCategory = useCallback((id: string, direction: 'up' | 'down') => {
    const index = settings.categories.findIndex((c) => c.id === id);
    if (index < 0) return;

    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= settings.categories.length) return;

    const next = [...settings.categories];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);

    persist({
      ...settings,
      categories: next,
    });
  }, [settings, persist]);

  const setGroupByCategory = useCallback((enabled: boolean) => {
    persist({
      ...settings,
      groupByCategory: enabled,
    });
  }, [settings, persist]);

  return {
    categories: settings.categories,
    groupByCategory: settings.groupByCategory,
    createCategory,
    deleteCategory,
    moveCategory,
    setGroupByCategory,
  };
}
