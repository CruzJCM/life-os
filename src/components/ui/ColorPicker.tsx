import { cn } from '../../lib/utils';
import { CARD_COLORS } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const { currentAccentColor } = useTheme();

  const colors = currentAccentColor && !CARD_COLORS.some((c) => c.value.toLowerCase() === currentAccentColor.toLowerCase())
    ? [{ value: currentAccentColor, name: 'Acento actual' }, ...CARD_COLORS]
    : CARD_COLORS;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          className={cn(
            'relative w-8 h-8 rounded-full transition-all duration-200',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            value === color.value && 'ring-2 ring-offset-2 ring-[var(--text-primary)]'
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
          title={color.name}
        >
          {color.name === 'Acento actual' && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[var(--accent-primary)] text-white text-[9px] leading-4 font-semibold">
              T
            </span>
          )}
        </button>
      ))}
    </div>
  );
}