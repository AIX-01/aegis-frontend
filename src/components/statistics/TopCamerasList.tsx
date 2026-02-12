import React from 'react';
import { MapPin } from 'lucide-react';
import { CameraRankItem } from './CameraRankItem';

interface CameraRankData {
    rank: number;
    name: string;
    count: number;
    alert: boolean;
}

interface TopCamerasListProps {
    items: CameraRankData[];
}

export const TopCamerasList: React.FC<TopCamerasListProps> = ({ items = [] }) => {
    const maxCount = Math.max(...items.map(i => i.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin size={18} className="text-slate-400" />
          최다 알림 발생 구역 (카메라)
        </h2>
      </div>

      <div className="space-y-5 mt-4">
        {items.length > 0 ? items.map(item => (
            <CameraRankItem
                key={item.rank}
                rank={item.rank}
                name={item.name}
                count={item.count}
                maxCount={maxCount}
                alert={item.alert}
            />
        )) : <p className="text-center text-slate-500">데이터가 없습니다.</p>}
      </div>

      <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium bg-blue-50 rounded-lg hover:bg-blue-100 transition">
        카메라별 전체 목록 보기
      </button>
    </div>
  );
};
