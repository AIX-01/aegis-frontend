import React from 'react';

interface CameraRankItemProps {
  rank: number;
  name: string;
  count: number;
  maxCount: number;
  alert?: boolean;
}

export const CameraRankItem: React.FC<CameraRankItemProps> = ({ rank, name, count, maxCount, alert }) => {
  const percentage = (count / maxCount) * 100;
  return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {rank}
          </span>
            <span className="text-sm font-medium text-slate-700">{name}</span>
          </div>
          <span className={`text-sm font-bold ${alert ? 'text-red-500' : 'text-slate-700'}`}>{count}건</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
              className={`h-2 rounded-full ${alert ? 'bg-red-400' : 'bg-blue-400'}`}
              style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
  );
};
