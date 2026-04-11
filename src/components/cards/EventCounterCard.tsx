import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { BaseCard } from './BaseCard';
import type { Card, EventCounterConfig } from '../../types';
import { daysUntil, formatDate } from '../../lib/utils';

interface EventCounterCardProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

export function EventCounterCard({ card, onEdit, onDelete, onArchive }: EventCounterCardProps) {
  const config = card.config as EventCounterConfig;
  const visual = config.visual ?? { opacity: 0.9, blur: 28 };
  const [days, setDays] = useState(0);

  useEffect(() => {
    const updateDays = () => {
      setDays(daysUntil(config.target_date));
    };

    updateDays();

    // Update every minute
    const interval = setInterval(updateDays, 60000);
    return () => clearInterval(interval);
  }, [config.target_date]);

  const isPast = days < 0;
  const isUrgent = days >= 0 && days <= 7;

  return (
    <BaseCard
      title={card.title}
      icon={Calendar}
      color={card.color}
      opacity={visual.opacity}
      blur={visual.blur}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        {/* Days Display */}
        <div
          className={`text-6xl font-bold mb-2 ${
            isPast
              ? 'text-[var(--text-tertiary)]'
              : isUrgent
                ? 'text-[var(--accent-rose)]'
                : 'text-[var(--text-primary)]'
          }`}
        >
          {Math.abs(days)}
        </div>

        <div className="text-sm text-[var(--text-secondary)] mb-4">
          {isPast ? 'días pasados desde' : 'días hasta'}
        </div>

        <div className="text-lg font-medium text-[var(--text-primary)] mb-1">
          {config.event_name}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(config.target_date)}
        </div>

        {/* Progress Ring */}
        {days >= 0 && days <= 30 && (
          <div className="mt-4 w-full">
            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((30 - days) / 30) * 100)}%`,
                  backgroundColor: isUrgent ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </BaseCard>
  );
}