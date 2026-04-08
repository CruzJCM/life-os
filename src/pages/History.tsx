import { useState } from 'react';
import { Header, MainLayout } from '../components/layout';
import { useHistory } from '../hooks';
import { Calendar, Target, CheckCircle2, TrendingUp, Clock, Archive } from 'lucide-react';
import type { CardType, CardHistory } from '../types';
import { formatDate, formatRelativeTime } from '../lib/utils';

const typeIcons: Record<CardType, typeof Calendar> = {
  event_counter: Calendar,
  goal_counter: Target,
  daily_checklist: CheckCircle2,
  goal_progress: TrendingUp,
};

const typeLabels: Record<CardType, string> = {
  event_counter: 'Evento',
  goal_counter: 'Objetivo',
  daily_checklist: 'Checklist',
  goal_progress: 'Meta',
};

export function History() {
  const [selectedType, setSelectedType] = useState<CardType | 'all'>('all');
  const { history, loading } = useHistory({
    type: selectedType !== 'all' ? selectedType : undefined,
  });

  const filteredHistory = selectedType === 'all'
    ? history
    : history.filter(h => h.card_type === selectedType);

  return (
    <MainLayout>
      <Header title="Historial" />
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <FilterButton
              label="Todos"
              active={selectedType === 'all'}
              onClick={() => setSelectedType('all')}
            />
            <FilterButton
              label="Eventos"
              active={selectedType === 'event_counter'}
              onClick={() => setSelectedType('event_counter')}
              icon={Calendar}
            />
            <FilterButton
              label="Objetivos"
              active={selectedType === 'goal_counter'}
              onClick={() => setSelectedType('goal_counter')}
              icon={Target}
            />
            <FilterButton
              label="Checklists"
              active={selectedType === 'daily_checklist'}
              onClick={() => setSelectedType('daily_checklist')}
              icon={CheckCircle2}
            />
            <FilterButton
              label="Metas"
              active={selectedType === 'goal_progress'}
              onClick={() => setSelectedType('goal_progress')}
              icon={TrendingUp}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                <Archive className="w-10 h-10 text-[var(--text-tertiary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Sin historial aún
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md">
                Las tarjetas que completes aparecerán aquí con sus estadísticas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: typeof Calendar;
}

function FilterButton({ label, active, onClick, icon: Icon }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        active
          ? 'bg-[var(--accent-primary)] text-white'
          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}

interface HistoryCardProps {
  item: CardHistory;
}

function HistoryCard({ item }: HistoryCardProps) {
  const Icon = typeIcons[item.card_type];
  const config = item.final_config as Record<string, unknown>;

  return (
    <div className="card-base p-5 hover:scale-[1.01] transition-transform cursor-pointer">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-tertiary)]">
                  {typeLabels[item.card_type]}
                </span>
                {item.card_type === 'event_counter' && config.target_date && (
                  <span>{formatDate(config.target_date as string)}</span>
                )}
              </div>
            </div>

            {/* Duration badge */}
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(item.completed_at)}</span>
              </div>
              {item.duration_days > 0 && (
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  {item.duration_days} días activo
                </div>
              )}
            </div>
          </div>

          {/* Stats based on type */}
          {item.card_type === 'goal_counter' && (
            <div className="mt-3 text-sm text-[var(--text-tertiary)]">
              Total: {config.current_count as number} veces
            </div>
          )}

          {item.card_type === 'goal_progress' && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-emerald)] rounded-full"
                  style={{
                    width: `${Math.min(100, ((config.current as number) / (config.target as number)) * 100)}%`
                  }}
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                {config.current} / {config.target} {config.unit as string}
              </span>
            </div>
          )}

          {item.card_type === 'daily_checklist' && (
            <div className="mt-3 text-sm text-[var(--text-tertiary)]">
              {(config.items as { completed: boolean }[]).filter(i => i.completed).length} tareas completadas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}