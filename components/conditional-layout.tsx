'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const NO_SIDEBAR_ROUTES = ['/login'];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const shouldShowSidebar = !NO_SIDEBAR_ROUTES.includes(pathname) && !pathname.startsWith('/evaluation') && !pathname.startsWith('/tev');

  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
