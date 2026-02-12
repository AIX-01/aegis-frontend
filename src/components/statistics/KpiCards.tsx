import React from 'react';
import { Activity, AlertTriangle, Camera, ShieldCheck } from 'lucide-react';
import { KpiCard } from './KpiCard';

interface KpiData {
    totalEvents: string;
    totalEventsTrend: string;
    totalEventsTrendUp: boolean;
    emergencyAlerts: string;
    emergencyAlertsTrend: string;
    emergencyAlertsTrendUp: boolean;
    analysisCompletionRate: string;
    analysisCompletionRateTrend: string;
    analysisCompletionRateTrendUp: boolean;
    monitoringCameras: string;
    monitoringCamerasUnit: string;
    monitoringCamerasTrend: string;
    monitoringCamerasTrendUp: boolean;
}

interface KpiCardsProps {
  data: KpiData;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-0 fill-mode-backwards">
            <KpiCard
                title="모니터링 카메라"
                value={data.monitoringCameras}
                unit={data.monitoringCamerasUnit}
                trend={data.monitoringCamerasTrend}
                trendUp={data.monitoringCamerasTrendUp}
                icon={<Camera size={20} className="text-purple-500" />}
                color="bg-purple-50"
            />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
          <KpiCard
            title="총 발생 이벤트"
            value={data.totalEvents}
            unit="건"
            trend={data.totalEventsTrend}
            trendUp={data.totalEventsTrendUp}
            icon={<Activity size={20} className="text-blue-500" />}
            color="bg-blue-50"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-backwards">
          <KpiCard
            title="긴급 (위험) 알림"
            value={data.emergencyAlerts}
            unit="건"
            trend={data.emergencyAlertsTrend}
            trendUp={data.emergencyAlertsTrendUp}
            icon={<AlertTriangle size={20} className="text-red-500" />}
            color="bg-red-50"
            alert={true}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-backwards">
          <KpiCard
            title="분석 완료율 (AI)"
            value={data.analysisCompletionRate}
            unit="%"
            trend={data.analysisCompletionRateTrend}
            trendUp={data.analysisCompletionRateTrendUp}
            icon={<ShieldCheck size={20} className="text-emerald-500" />}
            color="bg-emerald-50"
            description="10건 중 9건 분석 완료"
          />
        </div>
    </div>
  );
};
