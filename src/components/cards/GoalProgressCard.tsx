import { useState } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCard } from './BaseCard';
import type { Card, GoalProgressConfig } from '../../types';
import { calculateProgress } from '../../lib/utils';

interface GoalProgressCardProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUpdate?: (config: GoalProgressConfig) => void;
}

export function GoalProgressCard({
  card,
  onEdit,
  onDelete,
  onArchive,
  onUpdate,
}: GoalProgressCardProps) {
  const config = card.config as GoalProgressConfig;
  const [inputValue, setInputValue] = useState(config.current.toString());
  const progress = calculateProgress(config.current, config.target);
  const isComplete = config.current >= config.target;

  const handleUpdate = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0 && onUpdate) {
      onUpdate({
        ...config,
        current: value,
      });
    } else {
      setInputValue(config.current.toString());
    }
  };

  // Circle properties
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <BaseCard
      title={card.title}
      icon={isComplete ? Award : TrendingUp}
      color={card.color}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
    >
      <div className="flex flex-col items-center justify-between h-full">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={isComplete ? 'var(--accent-emerald)' : card.color}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={Math.round(progress)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[var(--text-primary)]"
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </div>

        {/* Value Input */}
        <div className="w-full flex items-center justify-center gap-2 mb-4">
          <motion.input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdate();
            }}
            whileFocus={{ scale: 1.02 }}
            className="w-24 text-center text-2xl font-bold bg-transparent border-b-2 border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none text-[var(--text-primary)] transition-colors"
          />
          <span className="text-lg text-[var(--text-secondary)]">
            / {config.target.toLocaleString()} {config.unit}
          </span>
        </div>

        {/* Target Info */}
        <div className="text-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--text-tertiary)]"
          >
            {isComplete ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-[var(--accent-emerald)] font-medium"
              >
                ¡Objetivo alcanzado!
              </motion.span>
            ) : (
              <>
                Faltan{' '}
                <span className="text-[var(--text-primary)] font-medium">
                  {(config.target - config.current).toLocaleString()} {config.unit}
                </span>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </BaseCard>
  );
}