'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CCTVGrid } from "@/components/dashboard/CCTVGrid";
import { EventLog } from "@/components/dashboard/EventLog";
import { AIResponseStatus } from "@/components/dashboard/AIResponseStatus";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, ClipboardList, LayoutDashboard, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { camerasApi, eventsApi, aiResponsesApi } from "@/lib/api";
import type { Camera, Event, AIResponse } from "@/types";

export function DashboardContent() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [camerasData, eventsData, aiResponsesData] = await Promise.all([
          camerasApi.getAll(),
          eventsApi.getAll(),
          aiResponsesApi.getAll(),
        ]);
        setCameras(camerasData);
        setEvents(eventsData);
        setAiResponses(aiResponsesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout title="대시보드">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              대시보드
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="m-0">
            <div className="space-y-6">
              {/* Top section: CCTV + Event Log */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* CCTV Grid - takes 2 columns */}
                <Card className="lg:col-span-2 soft-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      실시간 CCTV 모니터링
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!loading && <CCTVGrid cameras={cameras} />}
                  </CardContent>
                </Card>

                {/* Right sidebar: Event Log + AI Status */}
                <div className="space-y-6">
                  <Card className="soft-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        실시간 이벤트
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!loading && <EventLog events={events} />}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Response Status */}
              <Card className="soft-shadow">
                <CardContent className="p-6">
                  {!loading && <AIResponseStatus responses={aiResponses} events={events} />}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="m-0">
            <StatsDashboard />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
