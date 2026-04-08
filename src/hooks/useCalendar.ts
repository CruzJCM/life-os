import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Card } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  card: Card;
}

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  eventsForDate: (date: Date) => CalendarEvent[];
}

/**
 * Hook para manejar eventos del calendario
 */
export function useCalendar(): UseCalendarReturn {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Obtener tarjetas de tipo event_counter
  useEffect(() => {
    const fetchEvents = async () => {
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
          .eq('type', 'event_counter')
          .eq('status', 'active');

        if (error) throw error;
        setCards(data || []);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Convertir tarjetas a eventos de calendario
  const events = useMemo<CalendarEvent[]>(() => {
    return cards.map(card => {
      const config = card.config as { target_date: string; event_name: string };
      return {
        id: card.id,
        title: card.title,
        date: new Date(config.target_date),
        card,
      };
    });
  }, [cards]);

  // Obtener eventos para una fecha específica
  const eventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const targetDate = date.toDateString();
    return events.filter(event => event.date.toDateString() === targetDate);
  }, [events]);

  return {
    events,
    loading,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    eventsForDate,
  };
}