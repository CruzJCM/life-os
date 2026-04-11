import { useState } from 'react';
import { Modal, Input, Button, ColorPicker } from '../ui';
import type { Card, CardType, UpdateCardDTO } from '../../types';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateCardDTO) => Promise<void>;
  onApplyVisualToAll?: (sourceCardId: string, visual: { opacity: number; blur: number }) => Promise<void>;
}

export function EditCardModal({
  card,
  isOpen,
  onClose,
  onSave,
  onApplyVisualToAll,
}: EditCardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [color, setColor] = useState(card.color);
  const [cardOpacity, setCardOpacity] = useState((card.config as any).visual?.opacity ?? 0.9);
  const [cardBlur, setCardBlur] = useState((card.config as any).visual?.blur ?? 28);
  const [isLoading, setIsLoading] = useState(false);

  // Event counter
  const [targetDate, setTargetDate] = useState(
    card.type === 'event_counter' ? (card.config as any).target_date : ''
  );
  const [eventName, setEventName] = useState(
    card.type === 'event_counter' ? (card.config as any).event_name : ''
  );

  // Goal counter
  const [period, setPeriod] = useState<'week' | 'month'>(
    card.type === 'goal_counter' ? (card.config as any).period : 'week'
  );
  const [targetCount, setTargetCount] = useState<number | ''>(
    card.type === 'goal_counter' ? ((card.config as any).target_count ?? '') : ''
  );

  // Goal progress
  const [goalTarget, setGoalTarget] = useState<number | ''>(
    card.type === 'goal_progress' ? (card.config as any).target : ''
  );
  const [unit, setUnit] = useState(
    card.type === 'goal_progress' ? (card.config as any).unit : ''
  );

  const handleSave = async () => {
    if (!title) return;
    setIsLoading(true);
    try {
      let config = { ...card.config } as any;

      switch (card.type as CardType) {
        case 'event_counter':
          config = { ...config, target_date: targetDate, event_name: eventName || title };
          break;
        case 'goal_counter':
          config = { ...config, period, target_count: targetCount || null };
          break;
        case 'goal_progress':
          config = { ...config, target: goalTarget || 100, unit: unit || '' };
          break;
        // daily_checklist: items are edited inline, nothing extra here
      }

      config = {
        ...config,
        visual: {
          opacity: cardOpacity,
          blur: cardBlur,
        },
      };

      await onSave(card.id, { title, color, config });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const canSave = () => {
    if (!title) return false;
    if (card.type === 'event_counter' && !targetDate) return false;
    if (card.type === 'goal_progress' && !goalTarget) return false;
    return true;
  };

  const handleApplyVisualToAll = async () => {
    if (!onApplyVisualToAll) return;
    setIsLoading(true);
    try {
      await onApplyVisualToAll(card.id, {
        opacity: cardOpacity,
        blur: cardBlur,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar tarjeta">
      <div className="space-y-4">
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarjeta"
        />

        {card.type === 'event_counter' && (
          <>
            <Input
              label="Nombre del evento"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ej: Cumpleaños"
            />
            <Input
              label="Fecha objetivo"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </>
        )}

        {card.type === 'goal_counter' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Período
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('week')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === 'week'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === 'month'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                >
                  Mensual
                </button>
              </div>
            </div>
            <Input
              label="Objetivo (opcional)"
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Ej: 5"
            />
          </div>
        )}

        {card.type === 'goal_progress' && (
          <div className="space-y-4">
            <Input
              label="Objetivo"
              type="number"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Ej: 10000"
            />
            <Input
              label="Unidad"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ej: $, kg, km"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Color
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Opacidad de tarjeta
              </label>
              <span className="text-xs text-[var(--text-tertiary)]">
                {Math.round(cardOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.55}
              max={1}
              step={0.01}
              value={cardOpacity}
              onChange={(e) => setCardOpacity(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent-primary)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Blur de tarjeta
              </label>
              <span className="text-xs text-[var(--text-tertiary)]">{cardBlur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={cardBlur}
              onChange={(e) => setCardBlur(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-primary)]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleApplyVisualToAll}
            disabled={!onApplyVisualToAll}
            isLoading={isLoading}
          >
            Aplicar visual a todas
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={!canSave()}
            isLoading={isLoading}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
