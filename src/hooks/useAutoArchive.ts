import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para archivar automáticamente eventos que ya pasaron
 * Se ejecuta al cargar la app y cada día a medianoche
 */
export function useAutoArchive() {
  const { user } = useAuth();

  // Verificar y archivar eventos pasados
  const checkAndArchive = useCallback(async () => {
    if (!user) return;

    try {
      // Obtener todos los event_counter activos
      const { data: events, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'event_counter')
        .eq('status', 'active');

      if (fetchError) throw fetchError;
      if (!events || events.length === 0) return;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      for (const card of events) {
        const config = card.config as { target_date: string; event_name: string };
        const targetDate = new Date(config.target_date);
        targetDate.setHours(0, 0, 0, 0);

        // Si el evento ya pasó (más de 1 día), archivarlo
        const daysSinceEvent = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceEvent > 0) {
          // Marcar como completado
          // El trigger archive_completed_card en la BD lo moverá al historial
          await supabase
            .from('cards')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', card.id);
        }
      }
    } catch (err) {
      console.error('Error auto-archiving events:', err);
    }
  }, [user]);

  // Ejecutar al cargar
  useEffect(() => {
    checkAndArchive();
  }, [checkAndArchive]);

  // Programar ejecución a medianoche
  useEffect(() => {
    const scheduleNextArchive = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 5, 0, 0); // 00:05 para evitar conflictos con reset
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        checkAndArchive();
        scheduleNextArchive();
      }, msUntilMidnight);
    };

    const timeoutId = scheduleNextArchive();
    return () => clearTimeout(timeoutId);
  }, [checkAndArchive]);

  return { checkAndArchive };
}