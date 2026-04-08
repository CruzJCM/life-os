import { cn } from '../../lib/utils';
import { CARD_COLORS } from '../../lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {CARD_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          className={cn(
            'w-8 h-8 rounded-full transition-all duration-200',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            value === color.value && 'ring-2 ring-offset-2 ring-[var(--text-primary)]'
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );
}