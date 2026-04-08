import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para resetear automáticamente los checklists diarios
 * Se ejecuta al cargar la app y cada día a medianoche
 */
export function useDailyReset() {
  const { user } = useAuth();

  // Verificar y resetear checklists que necesitan reset
  const checkAndReset = useCallback(async () => {
    if (!user) return;

    try {
      // Obtener todos los checklists activos
      const { data: checklists, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'daily_checklist')
        .eq('status', 'active');

      if (fetchError) throw fetchError;
      if (!checklists || checklists.length === 0) return;

      const today = new Date().toISOString().split('T')[0];

      for (const card of checklists) {
        const config = card.config as { items: { id: string; text: string; completed: boolean }[]; last_reset_at?: string };

        // Si nunca se ha reseteado o el último reset fue antes de hoy
        if (!config.last_reset_at || config.last_reset_at.split('T')[0] < today) {
          // Guardar snapshot del día anterior (solo si hubo items completados)
          const completedItems = config.items.filter(item => item.completed);
          if (completedItems.length > 0) {
            await supabase.from('daily_snapshots').insert({
              card_id: card.id,
              user_id: user.id,
              snapshot_date: config.last_reset_at?.split('T')[0] || today,
              state_at_reset: config,
            });
          }

          // Resetear items a no completados
          const resetConfig = {
            ...config,
            items: config.items.map(item => ({ ...item, completed: false })),
            last_reset_at: new Date().toISOString(),
          };

          await supabase
            .from('cards')
            .update({ config: resetConfig })
            .eq('id', card.id);
        }
      }
    } catch (err) {
      console.error('Error resetting daily checklists:', err);
    }
  }, [user]);

  // Ejecutar al cargar
  useEffect(() => {
    checkAndReset();
  }, [checkAndReset]);

  // Programar ejecución a medianoche
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        checkAndReset();
        // Re-programar después de ejecutar
        scheduleNextReset();
      }, msUntilMidnight);
    };

    const timeoutId = scheduleNextReset();
    return () => clearTimeout(timeoutId);
  }, [checkAndReset]);

  return { checkAndReset };
}