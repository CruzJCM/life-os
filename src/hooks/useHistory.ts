import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CardHistory, CardType } from '../types';

interface HistoryFilters {
  type?: CardType;
  limit?: number;
}

/**
 * Hook para obtener el historial de tarjetas completadas
 */
export function useHistory(filters?: HistoryFilters) {
  const { user } = useAuth();
  const [history, setHistory] = useState<CardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('card_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('card_type', filters.type);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [user, filters?.type, filters?.limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Obtener historial detallado de una tarjeta específica
  const getHistoryDetail = async (historyId: string): Promise<CardHistory | null> => {
    try {
      const { data, error } = await supabase
        .from('card_history')
        .select('*')
        .eq('id', historyId)
        .single();

      if (error) throw error;
      return data as CardHistory;
    } catch (err) {
      console.error('Error fetching history detail:', err);
      return null;
    }
  };

  // Obtener snapshots diarios de un checklist
  const getDailySnapshots = async (cardId: string, limit = 30) => {
    try {
      const { data, error } = await supabase
        .from('daily_snapshots')
        .select('*')
        .eq('card_id', cardId)
        .order('snapshot_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching daily snapshots:', err);
      return [];
    }
  };

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    getHistoryDetail,
    getDailySnapshots,
  };
}