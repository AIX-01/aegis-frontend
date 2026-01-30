'use client';

import { ReactNode } from "react";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string; // 향후 사용을 위해 optional로 유지
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
