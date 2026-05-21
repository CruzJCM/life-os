import { useMemo, useRef, useState } from 'react';
import { Header, MainLayout } from '../components/layout';
import { CardGrid, AddCardButton } from '../components/grid';
import { CreateCardModal } from '../components/modals';
import { Button, Input, Modal } from '../components/ui';
import { useCardCategories, useCards, useGrid } from '../hooks';
import { ArrowDown, ArrowUp, Layers, Plus, Trash2 } from 'lucide-react';
import type { CreateCardDTO, Card, GridLayouts } from '../types';

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { cards, loading, createCard, updateCard, deleteCard, archiveCard } = useCards();
  const { layouts, handleLayoutChange } = useGrid();
  const {
    categories,
    groupByCategory,
    createCategory,
    deleteCategory: deleteCardCategory,
    moveCategory,
    setGroupByCategory,
  } = useCardCategories();
  const groupedModeLayoutSnapshotRef = useRef<GridLayouts | null>(null);

  const cloneLayouts = (value: GridLayouts): GridLayouts =>
    JSON.parse(JSON.stringify(value)) as GridLayouts;

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

  const handleCreateCategory = (name: string) => {
    return createCategory(name);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    deleteCardCategory(categoryId);

    const affectedCards = cards.filter((card) => (card.config as any).categoryId === categoryId);
    await Promise.all(
      affectedCards.map((card) =>
        updateCard(card.id, {
          config: {
            ...(card.config as Record<string, unknown>),
            categoryId: null,
          } as Card['config'],
        })
      )
    );
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

  const handleToggleGroupByCategory = () => {
    if (!groupByCategory) {
      groupedModeLayoutSnapshotRef.current = cloneLayouts(layouts);
      setGroupByCategory(true);
      return;
    }

    setGroupByCategory(false);
    if (groupedModeLayoutSnapshotRef.current) {
      handleLayoutChangeWrapper(groupedModeLayoutSnapshotRef.current);
      groupedModeLayoutSnapshotRef.current = null;
    }
  };

  const handleApplyVisualToAll = async (
    sourceCardId: string,
    visual: { opacity: number; blur: number }
  ) => {
    const updates = cards
      .filter((card) => card.id !== sourceCardId)
      .map((card) =>
        updateCard(card.id, {
          config: {
            ...(card.config as Record<string, unknown>),
            visual,
          } as Card['config'],
        })
      );

    await Promise.all(updates);
  };

  const groupedCards = useMemo(() => {
    const byCategory = new Map<string, Card[]>();
    const uncategorized: Card[] = [];

    cards.forEach((card) => {
      const categoryId = (card.config as any).categoryId as string | null | undefined;
      if (categoryId && categories.some((category) => category.id === categoryId)) {
        const bucket = byCategory.get(categoryId) || [];
        bucket.push(card);
        byCategory.set(categoryId, bucket);
      } else {
        uncategorized.push(card);
      }
    });

    const groups = categories
      .map((category) => ({
        id: category.id,
        title: category.name,
        cards: byCategory.get(category.id) || [],
      }))
      .filter((group) => group.cards.length > 0);

    if (uncategorized.length > 0) {
      groups.push({
        id: '__uncategorized__',
        title: 'Sin categoría',
        cards: uncategorized,
      });
    }

    return groups;
  }, [cards, categories]);

  const getFilteredLayouts = (groupCards: Card[]): GridLayouts => {
    const ids = new Set(groupCards.map((card) => card.id));
    return {
      lg: layouts.lg.filter((item) => ids.has(item.i)),
      md: layouts.md.filter((item) => ids.has(item.i)),
      sm: layouts.sm.filter((item) => ids.has(item.i)),
      xs: layouts.xs.filter((item) => ids.has(item.i)),
      xxs: layouts.xxs.filter((item) => ids.has(item.i)),
    };
  };

  return (
    <MainLayout>
      <Header title="Dashboard" />

      <div className="p-6">
        <div className="max-w-5xl mx-auto mb-4 flex flex-wrap items-center gap-3">
          <Button
            variant={groupByCategory ? 'primary' : 'secondary'}
            onClick={handleToggleGroupByCategory}
          >
            <Layers className="w-4 h-4" />
            Ordenar por categorías
          </Button>
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
            Gestionar categorías
          </Button>
        </div>

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
        ) : !groupByCategory ? (
          <>
            <CardGrid
              cards={cards}
              layouts={layouts}
              onLayoutChange={handleLayoutChangeWrapper}
              onCardUpdate={handleCardUpdate}
              onCardDelete={deleteCard}
              onCardArchive={archiveCard}
              onApplyVisualToAll={handleApplyVisualToAll}
              categories={categories}
              onCreateCategory={handleCreateCategory}
            />
            <div className="h-28 md:h-36" />
          </>
        ) : (
          <div className="space-y-8">
            {groupedCards.map((group) => (
              <section key={group.id} className="space-y-3">
                <div className="max-w-5xl mx-auto px-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm uppercase tracking-wide font-semibold text-[var(--text-secondary)]">
                      {group.title}
                    </h3>
                    <div className="h-px flex-1 bg-[var(--border-color)]" />
                  </div>
                </div>

                <CardGrid
                  cards={group.cards}
                  layouts={getFilteredLayouts(group.cards)}
                  onLayoutChange={() => {
                    // Keep grouped mode as a visual grouping layer only.
                  }}
                  onCardUpdate={handleCardUpdate}
                  onCardDelete={deleteCard}
                  onCardArchive={archiveCard}
                  onApplyVisualToAll={handleApplyVisualToAll}
                  categories={categories}
                  onCreateCategory={handleCreateCategory}
                />
              </section>
            ))}
            <div className="h-28 md:h-36" />
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {cards.length > 0 && <AddCardButton onClick={() => setShowCreateModal(true)} />}

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCard}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Gestionar categorías"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nueva categoría"
            />
            <Button
              onClick={() => {
                const createdId = createCategory(newCategoryName);
                if (createdId) setNewCategoryName('');
              }}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2 max-h-72 overflow-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">No hay categorías creadas.</p>
            ) : (
              categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                >
                  <span className="flex-1 text-sm text-[var(--text-primary)]">{category.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveCategory(category.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveCategory(category.id, 'down')}
                    disabled={index === categories.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4 text-[var(--accent-rose)]" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}