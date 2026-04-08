import { Plus } from 'lucide-react';
import { Button } from '../ui';

interface AddCardButtonProps {
  onClick: () => void;
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--accent-primary)] text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center group"
      title="Agregar tarjeta"
    >
      <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
    </button>
  );
}