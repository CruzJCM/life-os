import { useState } from 'react';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCard } from './BaseCard';
import type { Card, DailyChecklistConfig, ChecklistItem } from '../../types';
import { generateId } from '../../lib/utils';

interface DailyChecklistCardProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUpdate?: (config: DailyChecklistConfig) => void;
}

export function DailyChecklistCard({
  card,
  onEdit,
  onDelete,
  onArchive,
  onUpdate,
}: DailyChecklistCardProps) {
  const config = card.config as DailyChecklistConfig;
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const completedCount = config.items.filter((item) => item.completed).length;
  const totalCount = config.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleItem = (id: string) => {
    if (!onUpdate) return;
    onUpdate({
      ...config,
      items: config.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const addItem = () => {
    if (!onUpdate || !newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
    };
    onUpdate({
      ...config,
      items: [...config.items, newItem],
    });
    setNewItemText('');
    setIsAdding(false);
  };

  const removeItem = (id: string) => {
    if (!onUpdate) return;
    onUpdate({
      ...config,
      items: config.items.filter((item) => item.id !== id),
    });
  };

  return (
    <BaseCard
      title={card.title}
      icon={CheckCircle2}
      color={card.color}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
    >
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
            <span>Progreso</span>
            <span>{completedCount} / {totalCount}</span>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? 'var(--accent-emerald)' : card.color,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {progress === 100 && totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[var(--accent-emerald)] mt-1 text-center font-medium"
            >
              ¡Completado!
            </motion.div>
          )}
        </div>

        {/* Checklist Items */}
        <div className="flex-1 space-y-2 overflow-auto">
          <AnimatePresence mode="popLayout">
            {config.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <motion.button
                  onClick={() => toggleItem(item.id)}
                  className="flex-shrink-0"
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: item.completed ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.completed ? (
                      <CheckCircle2
                        className="w-5 h-5"
                        style={{ color: card.color }}
                      />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--text-tertiary)]" />
                    )}
                  </motion.div>
                </motion.button>
                <motion.span
                  className={`flex-1 text-sm ${
                    item.completed
                      ? 'text-[var(--text-tertiary)] line-through'
                      : 'text-[var(--text-primary)]'
                  }`}
                  animate={{
                    opacity: item.completed ? 0.6 : 1,
                  }}
                >
                  {item.text}
                </motion.span>
                <motion.button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-secondary)] transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Item */}
          <AnimatePresence>
            {isAdding ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2"
              >
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addItem();
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewItemText('');
                    }
                  }}
                  placeholder="Nueva tarea..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                />
                <motion.button
                  onClick={addItem}
                  className="p-1 rounded hover:bg-[var(--bg-secondary)]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: card.color }} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar tarea
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BaseCard>
  );
}