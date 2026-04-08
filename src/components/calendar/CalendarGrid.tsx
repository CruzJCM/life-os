import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from './CalendarDay';
import type { CalendarEvent } from '../../hooks/useCalendar';
import { cn } from '../../lib/utils';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | null) => void;
}

export function CalendarGrid({
  currentMonth,
  selectedDate,
  events,
  onMonthChange,
  onDateSelect,
}: CalendarGridProps) {
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Previous month days to fill the first week
    const prevMonth = new Date(year, month, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const lastDay = new Date(year, month + 1, 0);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to complete the last week
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Navigate months
  const goToPreviousMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    onMonthChange(new Date());
    onDateSelect(null);
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate?.toDateString() === date.toDateString()) {
      onDateSelect(null);
    } else {
      onDateSelect(date);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-[var(--accent-primary)] hover:underline"
          >
            Hoy
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[var(--text-tertiary)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dateEvents = getEventsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <CalendarDay
              key={index}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              hasEvents={dateEvents.length > 0}
              eventCount={dateEvents.length}
              onClick={() => handleDateClick(date)}
            />
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Eventos del {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                No hay eventos este día
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="card-base p-4 flex items-center gap-3"
                  style={{ '--card-accent': event.card.color } as React.CSSProperties}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.card.color }}
                  />
                  <span className="font-medium text-[var(--text-primary)]">
                    {event.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}