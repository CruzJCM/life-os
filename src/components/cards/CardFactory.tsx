import type { Card } from '../../types';
import { EventCounterCard } from './EventCounterCard';
import { GoalCounterCard } from './GoalCounterCard';
import { DailyChecklistCard } from './DailyChecklistCard';
import { GoalProgressCard } from './GoalProgressCard';

interface CardFactoryProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUpdate?: (card: Card) => void;
}

export function CardFactory({ card, onEdit, onDelete, onArchive, onUpdate }: CardFactoryProps) {
  switch (card.type) {
    case 'event_counter':
      return (
        <EventCounterCard
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      );

    case 'goal_counter':
      return (
        <GoalCounterCard
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );

    case 'daily_checklist':
      return (
        <DailyChecklistCard
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );

    case 'goal_progress':
      return (
        <GoalProgressCard
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );

    default:
      return null;
  }
}