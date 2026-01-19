'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export function StatisticsPageContent() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="통계">
        <StatsDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
