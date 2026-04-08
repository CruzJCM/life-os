import { useState } from 'react';
import { Header, MainLayout } from '../components/layout';
import { CardGrid, AddCardButton } from '../components/grid';
import { CreateCardModal } from '../components/modals';
import { useCards, useGrid } from '../hooks';
import { Plus } from 'lucide-react';
import type { CreateCardDTO, Card, GridLayouts } from '../types';

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { cards, loading, createCard, updateCard, deleteCard, archiveCard } = useCards();
  const { layouts, handleLayoutChange } = useGrid();

  const handleCreateCard = async (dto: CreateCardDTO) => {
    await createCard(dto);
  };

  const handleCardUpdate = async (card: Card) => {
    await updateCard(card.id, {
      title: card.title,
      description: card.description,
      color: card.color,
      icon: card.icon,
      config: card.config,
      position_x: card.position_x,
      position_y: card.position_y,
      width: card.width,
      height: card.height,
      status: card.status,
    });
  };

  const handleLayoutChangeWrapper = (newLayouts: GridLayouts) => {
    handleLayoutChange(newLayouts.lg, {
      lg: newLayouts.lg,
      md: newLayouts.md,
      sm: newLayouts.sm,
      xs: newLayouts.xs,
      xxs: newLayouts.xxs,
    });
  };

  return (
    <MainLayout>
      <Header title="Dashboard" />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]" />
          </div>
        ) : cards.length === 0 ? (
          <div className="max-w-5xl mx-auto">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                <Plus className="w-10 h-10 text-[var(--text-tertiary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Comienza a organizar tu vida
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                Crea tarjetas para contar días hasta eventos, seguir tus objetivos,
                o gestionar tareas diarias.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear primera tarjeta
              </button>
            </div>
          </div>
        ) : (
          <CardGrid
            cards={cards}
            layouts={layouts}
            onLayoutChange={handleLayoutChangeWrapper}
            onCardUpdate={handleCardUpdate}
            onCardDelete={deleteCard}
            onCardArchive={archiveCard}
          />
        )}
      </div>

      {/* Floating Add Button */}
      {cards.length > 0 && <AddCardButton onClick={() => setShowCreateModal(true)} />}

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCard}
      />
    </MainLayout>
  );
}