import { useState } from 'react';
import type { Card, UpdateCardDTO } from '../../types';
import { EventCounterCard } from './EventCounterCard';
import { GoalCounterCard } from './GoalCounterCard';
import { DailyChecklistCard } from './DailyChecklistCard';
import { GoalProgressCard } from './GoalProgressCard';
import { EditCardModal } from '../modals/EditCardModal';

interface CardFactoryProps {
  card: Card;
  onDelete?: () => void;
  onArchive?: () => void;
  onUpdate?: (card: Card) => void;
  onApplyVisualToAll?: (sourceCardId: string, visual: { opacity: number; blur: number }) => Promise<void>;
}

export function CardFactory({
  card,
  onDelete,
  onArchive,
  onUpdate,
  onApplyVisualToAll,
}: CardFactoryProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSave = async (_id: string, updates: UpdateCardDTO) => {
    if (!onUpdate) return;
    onUpdate({ ...card, ...updates, config: updates.config ?? card.config });
  };

  const sharedProps = {
    onEdit: () => setShowEditModal(true),
    onDelete,
    onArchive,
  };

  let cardComponent = null;

  switch (card.type) {
    case 'event_counter':
      cardComponent = <EventCounterCard card={card} {...sharedProps} />;
      break;
    case 'goal_counter':
      cardComponent = (
        <GoalCounterCard
          card={card}
          {...sharedProps}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );
      break;
    case 'daily_checklist':
      cardComponent = (
        <DailyChecklistCard
          card={card}
          {...sharedProps}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );
      break;
    case 'goal_progress':
      cardComponent = (
        <GoalProgressCard
          card={card}
          {...sharedProps}
          onUpdate={(config) => onUpdate?.({ ...card, config })}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <>
      {cardComponent}
      <EditCardModal
        card={card}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        onApplyVisualToAll={onApplyVisualToAll}
      />
    </>
  );
}
