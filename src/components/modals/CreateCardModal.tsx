import { useState } from 'react';
import { Modal, Input, Button, ColorPicker } from '../ui';
import { Calendar, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import type { CardType, CreateCardDTO } from '../../types';
import { CARD_COLORS, generateId } from '../../lib/utils';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CreateCardDTO) => Promise<void>;
}

type CardTypeOption = {
  type: CardType;
  label: string;
  description: string;
  icon: typeof Calendar;
};

const cardTypes: CardTypeOption[] = [
  {
    type: 'event_counter',
    label: 'Contador de evento',
    description: 'Cuenta los días hasta una fecha importante',
    icon: Calendar,
  },
  {
    type: 'goal_counter',
    label: 'Contador de objetivos',
    description: 'Cuenta cuántas veces hiciste algo',
    icon: Target,
  },
  {
    type: 'daily_checklist',
    label: 'Checklist diario',
    description: 'Lista de tareas que se reinician cada día',
    icon: CheckCircle2,
  },
  {
    type: 'goal_progress',
    label: 'Meta con progreso',
    description: 'Progreso hacia un objetivo numérico',
    icon: TrendingUp,
  },
];

const defaultConfigs: Record<CardType, Record<string, unknown>> = {
  event_counter: { target_date: '', event_name: '' },
  goal_counter: { period: 'week', current_count: 0, target_count: null, period_start: new Date().toISOString() },
  daily_checklist: { items: [] },
  goal_progress: { current: 0, target: 100, unit: '' },
};

export function CreateCardModal({ isOpen, onClose, onCreate }: CreateCardModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(CARD_COLORS[0].value);
  const [isLoading, setIsLoading] = useState(false);

  // Event counter specific
  const [targetDate, setTargetDate] = useState('');
  const [eventName, setEventName] = useState('');

  // Goal counter specific
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [targetCount, setTargetCount] = useState<number | ''>('');

  // Goal progress specific
  const [goalTarget, setGoalTarget] = useState<number | ''>('');
  const [unit, setUnit] = useState('');

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setTitle('');
    setColor(CARD_COLORS[0].value);
    setTargetDate('');
    setEventName('');
    setPeriod('week');
    setTargetCount('');
    setGoalTarget('');
    setUnit('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!selectedType || !title) return;

    setIsLoading(true);
    try {
      let config: Record<string, unknown> = { ...defaultConfigs[selectedType] };

      switch (selectedType) {
        case 'event_counter':
          config = { target_date: targetDate, event_name: eventName || title };
          break;
        case 'goal_counter':
          config = {
            period,
            current_count: 0,
            target_count: targetCount || null,
            period_start: new Date().toISOString(),
          };
          break;
        case 'daily_checklist':
          config = { items: [] };
          break;
        case 'goal_progress':
          config = { current: 0, target: goalTarget || 100, unit: unit || '' };
          break;
      }

      await onCreate({
        type: selectedType,
        title,
        color,
        config: config as CreateCardDTO['config'],
      });

      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedType !== null;
    if (step === 2) {
      if (!title) return false;
      if (selectedType === 'event_counter' && !targetDate) return false;
      if (selectedType === 'goal_progress' && !goalTarget) return false;
      return true;
    }
    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear tarjeta">
      <div className="space-y-6">
        {/* Step 1: Select Type */}
        {step === 1 && (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Elige el tipo de tarjeta que quieres crear
            </p>
            <div className="grid grid-cols-2 gap-3">
              {cardTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    setSelectedType(type.type);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedType === type.type
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <type.icon
                    className="w-6 h-6 mb-2"
                    style={{
                      color:
                        selectedType === type.type
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)',
                    }}
                  />
                  <div className="font-medium text-[var(--text-primary)]">
                    {type.label}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedType && (
          <>
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cumpleaños de mamá"
            />

            {selectedType === 'event_counter' && (
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

            {selectedType === 'goal_counter' && (
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

            {selectedType === 'goal_progress' && (
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
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <Button variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={step === 1 ? () => setStep(2) : handleCreate}
            disabled={!canProceed()}
            isLoading={isLoading}
          >
            {step === 1 ? 'Siguiente' : 'Crear'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}