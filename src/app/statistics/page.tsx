'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { StatsContainer } from "@/components/statistics/StatsContainer";

export default function StatisticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="통계">
        <StatsContainer />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
