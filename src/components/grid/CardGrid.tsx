import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
// @ts-ignore
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
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
// Doubled columns so cards can be half the previous minimum width
const cols = { lg: 8, md: 8, sm: 4, xs: 2, xxs: 1 };
const rowHeight = 140;
const margin = [24, 24] as [number, number];
const resizeConfig = {
  enabled: true,
  handles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'] as const,
};

export function CardGrid({
  cards,
  layouts,
  onLayoutChange,
  onCardUpdate,
  onCardDelete,
  onCardArchive,
}: CardGridProps) {
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    setWidth(containerRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const gridLayouts = useMemo(() => {
    const lg: GridLayoutType[] = [];
    const md: GridLayoutType[] = [];
    const sm: GridLayoutType[] = [];
    const xs: GridLayoutType[] = [];
    const xxs: GridLayoutType[] = [];

    cards.forEach((card) => {
      // Multiply saved width by 2 to map old 4-col coords to new 8-col grid
      const item: GridLayoutType = {
        i: card.id,
        x: card.position_x * 2,
        y: card.position_y,
        w: card.width * 2,
        h: card.height,
        minW: 1,
        minH: 1,
        maxW: 8,
        maxH: 4,
      };

      lg.push(item);
      md.push(item);
      sm.push({ ...item, w: Math.min(item.w, 4) });
      xs.push({ ...item, w: Math.min(item.w, 2) });
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
    (_layout: unknown, allLayouts: Record<string, GridLayoutType[]>) => {
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
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6">
      <ResponsiveGridLayout
        className="layout"
        layouts={gridLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        margin={margin}
        width={width}
        resizeConfig={resizeConfig}
        onLayoutChange={handleLayoutChange as any}
        onDragStart={handleDragStart as any}
        onDragStop={handleDragStop as any}
        onResizeStop={handleResizeStop as any}
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
      </ResponsiveGridLayout>
    </div>
  );
}
