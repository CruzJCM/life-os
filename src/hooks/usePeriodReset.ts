import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para resetear automáticamente los contadores de objetivos (goal_counter)
 * al inicio de cada período (semana o mes)
 * Se ejecuta al cargar la app y cada día a medianoche
 */
export function usePeriodReset() {
  const { user } = useAuth();

  // Verificar y resetear goal_counters que necesitan reset
  const checkAndReset = useCallback(async () => {
    if (!user) return;

    try {
      // Obtener todos los goal_counter activos
      const { data: goalCounters, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'goal_counter')
        .eq('status', 'active');

      if (fetchError) throw fetchError;
      if (!goalCounters || goalCounters.length === 0) return;

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      for (const card of goalCounters) {
        const config = card.config as {
          period: 'week' | 'month';
          current_count: number;
          target_count?: number | null;
          period_start: string;
          last_reset_at?: string;
        };

        // Determinar cuándo debe resetearse
        const periodStart = new Date(config.period_start);
        let shouldReset = false;

        if (config.period === 'week') {
          // Resetear si ha pasado una semana desde period_start
          const weekInMs = 7 * 24 * 60 * 60 * 1000;
          const nextReset = new Date(periodStart.getTime() + weekInMs);
          shouldReset = now >= nextReset;
        } else if (config.period === 'month') {
          // Resetear si ha pasado un mes desde period_start
          const nextReset = new Date(periodStart);
          nextReset.setMonth(nextReset.getMonth() + 1);
          shouldReset = now >= nextReset;
        }

        // También resetear si el último reset fue antes del inicio del período actual
        if (config.last_reset_at) {
          const lastReset = new Date(config.last_reset_at);
          if (config.period === 'week') {
            // Encontrar el inicio de la semana actual
            const currentWeekStart = getStartOfWeek(now);
            shouldReset = shouldReset || lastReset < currentWeekStart;
          } else {
            // Encontrar el inicio del mes actual
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            shouldReset = shouldReset || lastReset < currentMonthStart;
          }
        }

        if (shouldReset && config.current_count > 0) {
          // Guardar snapshot del período anterior
          await supabase.from('period_snapshots').insert({
            card_id: card.id,
            user_id: user.id,
            period_type: config.period,
            period_start: config.period_start,
            period_end: today,
            final_count: config.current_count,
            target_count: config.target_count,
          });

          // Resetear el contador
          const newPeriodStart = config.period === 'week'
            ? getStartOfWeek(now).toISOString()
            : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

          await supabase
            .from('cards')
            .update({
              config: {
                ...config,
                current_count: 0,
                period_start: newPeriodStart,
                last_reset_at: now.toISOString(),
              },
            })
            .eq('id', card.id);
        }
      }
    } catch (err) {
      console.error('Error resetting goal counters:', err);
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
      tomorrow.setHours(0, 2, 0, 0); // 00:02 para evitar conflictos con otros resets
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        checkAndReset();
        scheduleNextReset();
      }, msUntilMidnight);
    };

    const timeoutId = scheduleNextReset();
    return () => clearTimeout(timeoutId);
  }, [checkAndReset]);

  return { checkAndReset };
}

/**
 * Obtiene el inicio de la semana (lunes) para una fecha dada
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
  return new Date(d.setDate(diff));
}