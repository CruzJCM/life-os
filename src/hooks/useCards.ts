import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Card, CreateCardDTO, UpdateCardDTO } from '../types';

export function useCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Error al cargar tarjetas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchCards();

    if (!user) return;

    const channel = supabase
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCards]);

  // Create card
  const createCard = async (dto: CreateCardDTO): Promise<Card | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
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
        .single();

      if (error) throw error;
      return data as Card;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tarjeta');
      return null;
    }
  };

  // Update card
  const updateCard = async (id: string, updates: UpdateCardDTO): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tarjeta');
      return false;
    }
  };

  // Delete card
  const deleteCard = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('cards').delete().eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tarjeta');
      return false;
    }
  };

  // Archive card (move to history)
  const archiveCard = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
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