import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CameraRankItemProps {
  rank: number;
  name: string;
  count: number;
  maxCount: number;
  alert?: boolean;
}

export const CameraRankItem: React.FC<CameraRankItemProps> = ({ rank, name, count, maxCount, alert = false }) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
        alert ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
      }`}>
        {rank}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">{name}</span>
          <span className={`text-sm font-bold ${alert ? 'text-red-500' : 'text-slate-600'}`}>{count} 건</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${alert ? 'bg-red-400' : 'bg-blue-400'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
