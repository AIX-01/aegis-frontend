import React from 'react';
import { MapPin } from 'lucide-react';
import { CameraRankItem } from './CameraRankItem';

export const TopCamerasList = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin size={18} className="text-slate-400" />
          최다 알림 발생 구역 (카메라)
        </h2>
      </div>

      <div className="space-y-5 mt-4">
        <CameraRankItem rank={1} name="CAM-01 (정문 출입구)" count={7} maxCount={10} alert={true} />
        <CameraRankItem rank={2} name="CAM-05 (지하주차장 B1)" count={4} maxCount={10} />
        <CameraRankItem rank={3} name="CAM-12 (후문 쓰레기장)" count={2} maxCount={10} />
        <CameraRankItem rank={4} name="CAM-03 (1층 로비)" count={1} maxCount={10} />
        <CameraRankItem rank={5} name="CAM-08 (비상계단 3F)" count={0} maxCount={10} />
      </div>

      <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium bg-blue-50 rounded-lg hover:bg-blue-100 transition">
        카메라별 전체 목록 보기
      </button>
    </div>
  );
};
