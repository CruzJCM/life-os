import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={cn(
          'workspace-main min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]'
        )}
      >
        {children}
      </main>
    </div>
  );
}