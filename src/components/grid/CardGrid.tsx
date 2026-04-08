import { useEffect, useMemo } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import { CardFactory } from '../cards';
import type { Card, GridLayout as GridLayoutType, GridLayouts } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface CardGridProps {
  cards: Card[];
  layouts: GridLayouts;
  onLayoutChange: (layouts: GridLayouts) => void;
  onCardUpdate: (card: Card) => void;
  onCardDelete: (id: string) => void;
  onCardArchive: (id: string) => void;
}

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 };
const rowHeight = 140;
const margin = [24, 24] as [number, number];

export function CardGrid({
  cards,
  layouts,
  onLayoutChange,
  onCardUpdate,
  onCardDelete,
  onCardArchive,
}: CardGridProps) {
  // Convert cards to grid items
  const gridLayouts = useMemo(() => {
    const lg: GridLayoutType[] = [];
    const md: GridLayoutType[] = [];
    const sm: GridLayoutType[] = [];
    const xs: GridLayoutType[] = [];
    const xxs: GridLayoutType[] = [];

    cards.forEach((card) => {
      const item: GridLayoutType = {
        i: card.id,
        x: card.position_x,
        y: card.position_y,
        w: card.width,
        h: card.height,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
      };

      lg.push(item);
      md.push(item);
      sm.push({ ...item, w: Math.min(item.w, 2) });
      xs.push({ ...item, w: 1 });
      xxs.push({ ...item, w: 1 });
    });

    return {
      lg: (layouts.lg ?? []).length > 0 ? layouts.lg : lg,
      md: (layouts.md ?? []).length > 0 ? layouts.md : md,
      sm: (layouts.sm ?? []).length > 0 ? layouts.sm : sm,
      xs: (layouts.xs ?? []).length > 0 ? layouts.xs : xs,
      xxs: (layouts.xxs ?? []).length > 0 ? layouts.xxs : xxs,
    };
  }, [cards, layouts]);

  const handleLayoutChange = (
    currentLayout: GridLayoutType[],
    allLayouts: { [key: string]: GridLayoutType[] }
  ) => {
    onLayoutChange({
      lg: allLayouts.lg || [],
      md: allLayouts.md || [],
      sm: allLayouts.sm || [],
      xs: allLayouts.xs || [],
      xxs: allLayouts.xxs || [],
    });
  };

  // Prevent scroll when dragging
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.react-grid-item')) {
        e.stopPropagation();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <ResponsiveGridLayout
        className="layout"
        layouts={gridLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        margin={margin}
        onLayoutChange={handleLayoutChange}
      >
        {cards.map((card) => (
          <div key={card.id} className="react-grid-item-wrapper">
            <CardFactory
              card={card}
              onCardUpdate={onCardUpdate}
              onCardDelete={() => onCardDelete(card.id)}
              onCardArchive={() => onCardArchive(card.id)}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}