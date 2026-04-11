import { useEffect, useState } from 'react';
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
  const visual = config.visual ?? { opacity: 0.9, blur: 28 };
  const [inputValue, setInputValue] = useState(config.current.toString());
  const progress = calculateProgress(config.current, config.target);
  const isComplete = config.current >= config.target;

  useEffect(() => {
    setInputValue(config.current.toString());
  }, [config.current]);

  const commitValue = (raw: string) => {
    const value = parseFloat(raw);
    if (!isNaN(value) && value >= 0 && onUpdate) {
      if (value === config.current) {
        setInputValue(config.current.toString());
        return;
      }
      onUpdate({ ...config, current: value });
    } else {
      setInputValue(config.current.toString());
    }
  };

  const nudge = (delta: number) => {
    const next = Math.max(0, config.current + delta);
    setInputValue(next.toString());
    if (onUpdate) onUpdate({ ...config, current: next });
  };

  // Circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const progressColor = isComplete ? 'var(--accent-emerald)' : card.color;

  return (
    <BaseCard
      title={card.title}
      icon={isComplete ? Award : TrendingUp}
      color={card.color}
      opacity={visual.opacity}
      blur={visual.blur}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
    >
      <div className="flex flex-col items-center justify-between h-full">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 mb-3" style={{ flexShrink: 0 }}>
          <svg width="128" height="128" className="transform -rotate-90">
            {/* Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="8"
            />
            {/* Progress — strokeDasharray is required for dashoffset to work */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={Math.round(clampedProgress)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
              style={{ color: progressColor }}
            >
              {Math.round(clampedProgress)}%
            </motion.span>
          </div>
        </div>

        {/* Value editor */}
        <div className="flex items-center gap-1 mb-3">
          {/* Down arrow */}
          <button
            onClick={() => nudge(-1)}
            disabled={config.current <= 0}
            style={{
              background: 'none',
              border: 'none',
              cursor: config.current <= 0 ? 'not-allowed' : 'pointer',
              padding: '4px 6px',
              borderRadius: '6px',
              color: 'var(--text-tertiary)',
              opacity: config.current <= 0 ? 0.3 : 1,
              lineHeight: 1,
              fontSize: '12px',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (config.current > 0) (e.currentTarget.style.color = card.color); }}
            onMouseLeave={e => { (e.currentTarget.style.color = 'var(--text-tertiary)'); }}
            title="Restar 1"
          >
            ▼
          </button>

          {/* Input */}
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
            onBlur={() => commitValue(inputValue)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitValue(inputValue);
              if (e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
              if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
            }}
            style={{
              width: '72px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              background: 'transparent',
              border: 'none',
              borderBottom: '1.5px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none',
              padding: '0 4px 2px',
              /* Hide native spinners */
              MozAppearance: 'textfield',
            } as React.CSSProperties}
          />

          {/* Up arrow */}
          <button
            onClick={() => nudge(1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '6px',
              color: 'var(--text-tertiary)',
              lineHeight: 1,
              fontSize: '12px',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget.style.color = card.color); }}
            onMouseLeave={e => { (e.currentTarget.style.color = 'var(--text-tertiary)'); }}
            title="Sumar 1"
          >
            ▲
          </button>

          <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
            / {config.target.toLocaleString()} {config.unit}
          </span>
        </div>

        {/* Status */}
        <div className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {isComplete ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{ color: 'var(--accent-emerald)', fontWeight: 500 }}
            >
              ¡Objetivo alcanzado!
            </motion.span>
          ) : (
            <>
              Faltan{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {(config.target - config.current).toLocaleString()} {config.unit}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hide webkit spinners globally for this component */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </BaseCard>
  );
}
