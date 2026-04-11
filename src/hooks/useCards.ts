import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Card, CreateCardDTO, UpdateCardDTO } from '../types';

const isDeepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWithRetry = async <T,>(operation: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await sleep(RETRY_BASE_MS * 2 ** attempt);
      }
    }
  }

  throw lastError;
};

const hasCardChanges = (card: Card, updates: UpdateCardDTO) => {
  const keys = Object.keys(updates) as Array<keyof UpdateCardDTO>;
  return keys.some((key) => {
    const next = updates[key];
    if (typeof next === 'undefined') return false;
    const current = card[key as keyof Card];
    return !isDeepEqual(current, next);
  });
};

export function useCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueMutation = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const run = mutationQueueRef.current.catch(() => undefined).then(operation);
    mutationQueueRef.current = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }, []);

  // Fetch initial cards
  const fetchCards = useCallback(async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('position_y', { ascending: true })
        .order('position_x', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tarjetas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchCards();

    if (!user) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`cards:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setCards((prev) => [...prev, payload.new as Card]);
            } else if (payload.eventType === 'UPDATE') {
              setCards((prev) =>
                prev.map((card) =>
                  card.id === payload.new.id ? (payload.new as Card) : card
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setCards((prev) =>
                prev.filter((card) => card.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Realtime no disponible — usando polling manual.');
          }
        });
    } catch (err) {
      console.warn('No se pudo inicializar Realtime:', err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, fetchCards]);

  // Create card
  const createCard = async (dto: CreateCardDTO): Promise<Card | null> => {
    if (!user) return null;

    try {
      const { data, error } = await enqueueMutation(() =>
        runWithRetry(async () =>
          supabase
            .from('cards')
            .insert({
              user_id: user.id,
              type: dto.type,
              title: dto.title,
              description: dto.description,
              color: dto.color || '#3B82F6',
              icon: dto.icon,
              config: dto.config,
              width: dto.width || 2,
              height: dto.height || 2,
            })
            .select()
            .single()
        )
      );

      if (error) throw error;
      return data as Card;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tarjeta');
      return null;
    }
  };

  // Update card
  const updateCard = async (id: string, updates: UpdateCardDTO): Promise<boolean> => {
    const currentCard = cards.find((card) => card.id === id);

    if (currentCard && !hasCardChanges(currentCard, updates)) {
      return true;
    }

    let rollbackSnapshot: Card | null = null;

    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        rollbackSnapshot = card;
        return {
          ...card,
          ...updates,
          config: updates.config ?? card.config,
        };
      })
    );

    try {
      const { error } = await enqueueMutation(() =>
        runWithRetry(() =>
          supabase
            .from('cards')
            .update(updates)
            .eq('id', id)
        )
      );

      if (error) throw error;
      return true;
    } catch (err) {
      if (rollbackSnapshot) {
        setCards((prev) =>
          prev.map((card) => (card.id === id ? rollbackSnapshot! : card))
        );
      }
      setError(err instanceof Error ? err.message : 'Error al actualizar tarjeta');
      return false;
    }
  };

  // Delete card
  const deleteCard = async (id: string): Promise<boolean> => {
    const rollbackSnapshot = cards.find((card) => card.id === id) ?? null;
    setCards((prev) => prev.filter((card) => card.id !== id));

    try {
      const { error } = await enqueueMutation(() =>
        runWithRetry(() => supabase.from('cards').delete().eq('id', id))
      );

      if (error) throw error;
      return true;
    } catch (err) {
      if (rollbackSnapshot) {
        setCards((prev) => {
          if (prev.some((card) => card.id === rollbackSnapshot.id)) return prev;
          return [...prev, rollbackSnapshot];
        });
      }
      setError(err instanceof Error ? err.message : 'Error al eliminar tarjeta');
      return false;
    }
  };

  // Archive card (move to history)
  const archiveCard = async (id: string): Promise<boolean> => {
    const rollbackSnapshot = cards.find((card) => card.id === id) ?? null;
    setCards((prev) => prev.filter((card) => card.id !== id));

    try {
      const { error } = await enqueueMutation(() =>
        runWithRetry(() =>
          supabase
            .from('cards')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', id)
        )
      );

      if (error) throw error;
      return true;
    } catch (err) {
      if (rollbackSnapshot) {
        setCards((prev) => {
          if (prev.some((card) => card.id === rollbackSnapshot.id)) return prev;
          return [...prev, rollbackSnapshot];
        });
      }
      setError(err instanceof Error ? err.message : 'Error al archivar tarjeta');
      return false;
    }
  };

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    archiveCard,
    refetch: fetchCards,
  };
}