'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsContainer } from "@/components/statistics/StatsContainer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export function StatisticsPageContent() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="통계">
        <StatsContainer />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
