import { useState } from 'react';
import { Plus, Minus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCard } from './BaseCard';
import type { Card, GoalCounterConfig } from '../../types';
import { calculateProgress } from '../../lib/utils';

interface GoalCounterCardProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUpdate?: (config: GoalCounterConfig) => void;
}

export function GoalCounterCard({
  card,
  onEdit,
  onDelete,
  onArchive,
  onUpdate,
}: GoalCounterCardProps) {
  const config = card.config as GoalCounterConfig;
  const [isAnimating, setIsAnimating] = useState(false);
  const progress = config.target_count
    ? calculateProgress(config.current_count, config.target_count)
    : null;

  const handleIncrement = () => {
    if (onUpdate) {
      onUpdate({
        ...config,
        current_count: (config.current_count || 0) + 1,
      });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const handleDecrement = () => {
    if (onUpdate && config.current_count > 0) {
      onUpdate({
        ...config,
        current_count: config.current_count - 1,
      });
    }
  };

  return (
    <BaseCard
      title={card.title}
      icon={Target}
      color={card.color}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
    >
      <div className="flex flex-col items-center justify-between h-full">
        {/* Counter Display */}
        <div className="flex flex-col items-center">
          <motion.div
            key={config.current_count}
            initial={{ scale: 1 }}
            animate={{
              scale: isAnimating ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-bold text-[var(--text-primary)] mb-2"
          >
            {config.current_count}
          </motion.div>
          <div className="text-sm text-[var(--text-secondary)]">
            {config.period === 'week' ? 'esta semana' : 'este mes'}
          </div>
        </div>

        {/* Progress Bar (if target exists) */}
        {progress !== null && (
          <div className="w-full my-4">
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
              <span>Progreso</span>
              <span>{config.current_count} / {config.target_count}</span>
            </div>
            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? 'var(--accent-emerald)' : card.color,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {progress >= 100 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[var(--accent-emerald)] mt-1 text-center font-medium"
              >
                ¡Objetivo alcanzado!
              </motion.div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleDecrement}
            disabled={config.current_count <= 0}
            className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: config.current_count > 0 ? 1.1 : 1 }}
            whileTap={{ scale: config.current_count > 0 ? 0.9 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <Minus className="w-5 h-5 text-[var(--text-secondary)]" />
          </motion.button>
          <motion.button
            onClick={handleIncrement}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${card.color}20` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Plus className="w-5 h-5" style={{ color: card.color }} />
          </motion.button>
        </div>
      </div>
    </BaseCard>
  );
}