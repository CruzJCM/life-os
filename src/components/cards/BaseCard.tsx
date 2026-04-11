import { type ReactNode, useState } from 'react';
import { MoreVertical, Trash2, Archive, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface BaseCardProps {
  title: string;
  icon?: LucideIcon;
  color?: string;
  opacity?: number;
  blur?: number;
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  className?: string;
}

export function BaseCard({
  title,
  icon: Icon,
  color = '#3B82F6',
  opacity = 0.9,
  blur = 28,
  children,
  onEdit,
  onDelete,
  onArchive,
  className,
}: BaseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        'relative w-full h-full flex flex-col card-base overflow-hidden',
        className
      )}
      style={
        {
          '--card-accent': color,
          '--card-accent-bg': `${color}15`,
          '--card-surface-opacity': String(Math.min(1, Math.max(0.5, opacity))),
          '--card-surface-blur': `${Math.min(40, Math.max(0, blur))}px`,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="card-interactive-zone flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          )}
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {title}
          </h3>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)] overflow-hidden z-20 animate-scale-in">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onArchive();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archivar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--accent-rose)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card-interactive-zone flex-1 p-5 overflow-auto">{children}</div>
    </div>
  );
}