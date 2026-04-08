import { cn } from '../../lib/utils';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  eventCount: number;
  onClick: () => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  hasEvents,
  eventCount,
  onClick,
}: CalendarDayProps) {
  const dayNumber = date.getDate();

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl transition-all',
        'hover:bg-[var(--bg-tertiary)]',
        !isCurrentMonth && 'opacity-30',
        isToday && 'ring-2 ring-[var(--accent-primary)]',
        isSelected && 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          isSelected ? 'text-white' : 'text-[var(--text-primary)]'
        )}
      >
        {dayNumber}
      </span>

      {/* Event indicator dots */}
      {hasEvents && (
        <div className="absolute bottom-1.5 flex gap-0.5">
          {eventCount === 1 ? (
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isSelected ? 'bg-white' : 'bg-[var(--accent-primary)]'
              )}
            />
          ) : (
            <span
              className={cn(
                'text-[10px] font-medium',
                isSelected ? 'text-white' : 'text-[var(--accent-primary)]'
              )}
            >
              {eventCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
}