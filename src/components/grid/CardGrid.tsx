import { useEffect, useMemo, useCallback, useRef } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import WidthProvider from 'react-grid-layout/build/WidthProvider';
import { CardFactory } from '../cards';
import type { Card, GridLayout as GridLayoutType, GridLayouts } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ResponsiveGridLayout);

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
  const isDraggingRef = useRef(false);

  // Convert cards to grid items - prefer saved layouts over card positions
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

  const handleLayoutChange = useCallback(
    (_currentLayout: GridLayoutType[], allLayouts: { [key: string]: GridLayoutType[] }) => {
      // Only emit change if not currently dragging (prevents excessive updates)
      if (!isDraggingRef.current) {
        onLayoutChange({
          lg: allLayouts.lg || [],
          md: allLayouts.md || [],
          sm: allLayouts.sm || [],
          xs: allLayouts.xs || [],
          xxs: allLayouts.xxs || [],
        });
      }
    },
    [onLayoutChange]
  );

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragStop = useCallback(
    (layout: GridLayoutType[]) => {
      isDraggingRef.current = false;
      // Emit the final layout change after drag stops
      onLayoutChange({
        lg: layout,
        md: layouts.md,
        sm: layouts.sm,
        xs: layouts.xs,
        xxs: layouts.xxs,
      });
    },
    [onLayoutChange, layouts]
  );

  const handleResizeStop = useCallback(
    (layout: GridLayoutType[]) => {
      // Emit layout change after resize stops
      onLayoutChange({
        lg: layout,
        md: layouts.md,
        sm: layouts.sm,
        xs: layouts.xs,
        xxs: layouts.xxs,
      });
    },
    [onLayoutChange, layouts]
  );

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
      <ResponsiveGrid
        className="layout"
        layouts={gridLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        margin={margin}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        compactType={null}
        preventCollision={true}
        useCSSTransforms={true}
        isResizable={true}
        isDraggable={true}
      >
        {cards.map((card) => (
          <div key={card.id} className="react-grid-item-wrapper">
            <CardFactory
              card={card}
              onUpdate={onCardUpdate}
              onDelete={() => onCardDelete(card.id)}
              onArchive={() => onCardArchive(card.id)}
            />
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
}