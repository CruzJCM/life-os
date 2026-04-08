import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent',
            'transition-all duration-200',
            error && 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--accent-rose)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';