import React, { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Camera,
    ShieldCheck,
    Calendar,
    ChevronDown,
    MapPin,
    Clock
} from 'lucide-react';

const AegisDashboard = () => {
    const [timeRange, setTimeRange] = useState('day');

    // 선택된 기간(일/주/월)에 따라 차트 제목과 축 데이터를 동적으로 변경하기 위한 설정 객체
    const chartConfig = {
        day: {
            lineTitle: '시간대별 이벤트 추이',
            lineXAxis: ['00시', '04시', '08시', '12시', '16시', '20시', '24시'],
            heatmapTitle: '구역/시간대별 집중도',
            heatmapY: ['정문', '후문', '주차장', '로비', '복도', '외곽', '옥상'],
        },
        week: {
            lineTitle: '요일별 이벤트 추이',
            lineXAxis: ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
            heatmapTitle: '요일/시간대별 발생 패턴',
            heatmapY: ['월', '화', '수', '목', '금', '토', '일'],
        },
        month: {
            lineTitle: '일별 이벤트 추이',
            lineXAxis: ['1일', '5일', '10일', '15일', '20일', '25일', '말일'],
            heatmapTitle: '요일/시간대별 발생 패턴 (월간 평균)',
            heatmapY: ['월', '화', '수', '목', '금', '토', '일'],
        }
    };

    const currentConfig = chartConfig[timeRange];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
            {/* Top Navigation Bar Simulation */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">AEGIS</span>
                    <span className="text-sm text-slate-500 ml-4 pl-4 border-l border-slate-300">통합 관제 통계</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 transition">
                        <Calendar size={14} />
                        <span>2026. 02. 12 (목)</span>
                    </button>
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                        A
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 mt-6">

                {/* Global Filter & Title */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">관제 데이터 현황</h1>
                        <p className="text-sm text-slate-500 mt-1">AI 시스템이 분석한 이벤트 및 알림 통계입니다.</p>
                    </div>

                    {/* Day / Week / Month Toggle */}
                    <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 flex">
                        {['day', 'week', 'month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    timeRange === range
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {range === 'day' ? '일간' : range === 'week' ? '주간' : '월간'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 1: KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KpiCard
                        title="총 발생 이벤트"
                        value="1,248"
                        unit="건"
                        trend="+12% (전일 대비)"
                        trendUp={true}
                        icon={<Activity size={20} className="text-blue-500" />}
                        color="bg-blue-50"
                    />
                    <KpiCard
                        title="긴급 (위험) 알림"
                        value="7"
                        unit="건"
                        trend="+2건 (전일 대비)"
                        trendUp={true}
                        icon={<AlertTriangle size={20} className="text-red-500" />}
                        color="bg-red-50"
                        alert={true}
                    />
                    <KpiCard
                        title="분석 완료율 (AI)"
                        value="99.8"
                        unit="%"
                        trend="변동 없음"
                        trendUp={null}
                        icon={<ShieldCheck size={20} className="text-emerald-500" />}
                        color="bg-emerald-50"
                    />
                    <KpiCard
                        title="모니터링 카메라"
                        value="45"
                        unit="/ 45 대"
                        trend="모두 정상 작동중"
                        trendUp={null}
                        icon={<Camera size={20} className="text-purple-500" />}
                        color="bg-purple-50"
                    />
                </div>

                {/* Section 2: Main Trends (Time & Type) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Line Chart Area (Time Trend) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock size={18} className="text-slate-400" />
                                {currentConfig.lineTitle}
                            </h2>
                            <button className="text-sm text-slate-500 flex items-center hover:text-slate-800">
                                상세보기 <ChevronDown size={14} className="ml-1" />
                            </button>
                        </div>

                        <div className="h-64 flex items-end justify-between relative pt-8 pb-6 border-b border-slate-100">
                            {/* Fake Y-Axis */}
                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400">
                                <span>15</span>
                                <span>10</span>
                                <span>5</span>
                                <span>0</span>
                            </div>

                            {/* Fake Chart Bars / Line points */}
                            <div className="w-full h-full flex items-end justify-between px-8 relative">
                                {/* SVG Area simulation */}
                                <svg className="absolute inset-0 h-full w-full px-8" preserveAspectRatio="none">
                                    <path
                                        d="M0,200 L40,190 L80,195 L120,180 L160,150 L200,40 L240,160 L280,180 L320,190 L360,185 L400,195 L440,200 L480,200 L480,200 L0,200 Z"
                                        fill="rgba(59, 130, 246, 0.1)"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    <polyline
                                        points="0,200 40,190 80,195 120,180 160,150 200,40 240,160 280,180 320,190 360,185 400,195 440,200 480,200"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Spike Marker */}
                                    <circle cx="200" cy="40" r="5" fill="#ef4444" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                                    <text x="200" y="25" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">급증 (16시)</text>
                                </svg>
                            </div>

                            {/* Fake X-Axis */}
                            <div className="absolute left-8 right-8 bottom-0 flex justify-between text-xs text-slate-400 mt-2">
                                {currentConfig.lineXAxis.map(label => (
                                    <span key={label}>{label}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart Area (Type Distribution) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-slate-400" />
                            주요 이벤트 유형
                        </h2>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {/* CSS Donut Chart */}
                            <div className="relative w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center"
                                 style={{ background: 'conic-gradient(#ef4444 0% 15%, #f59e0b 15% 45%, #10b981 45% 100%)' }}>
                                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <span className="text-2xl font-bold text-slate-800">7</span>
                                    <span className="text-xs text-slate-500">긴급 건수</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="w-full mt-8 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>무기 (Weapon)</div>
                                    <span className="font-semibold">3건 (15%)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span>폭력 (Violence)</div>
                                    <span className="font-semibold">2건 (30%)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>실신 (Fainting)</div>
                                    <span className="font-semibold">2건 (55%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Spatio-Temporal Analysis (Heatmap & Cameras) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Heatmap Area */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar size={18} className="text-slate-400" />
                                {currentConfig.heatmapTitle}
                            </h2>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">패턴 분석용</span>
                        </div>

                        <div className="flex">
                            {/* Y-axis (Dynamic based on timeRange) */}
                            <div className="flex flex-col justify-around text-xs text-slate-400 pr-3 font-medium h-48 pt-6">
                                {currentConfig.heatmapY.map(label => (
                                    <span key={label}>{label}</span>
                                ))}
                            </div>

                            {/* Heatmap Grid */}
                            <div className="flex-1 flex flex-col h-48">
                                {/* X-axis (Hours grouped) */}
                                <div className="flex justify-between text-xs text-slate-400 mb-2 px-2">
                                    <span>새벽 (0-6)</span>
                                    <span>오전 (6-12)</span>
                                    <span>오후 (12-18)</span>
                                    <span>야간 (18-24)</span>
                                </div>

                                {/* Grid Cells */}
                                <div className="flex-1 grid grid-rows-7 gap-1">
                                    {[...Array(7)].map((_, dayIdx) => (
                                        <div key={dayIdx} className="grid grid-cols-4 gap-1">
                                            {[...Array(4)].map((_, timeIdx) => {
                                                // Generate fake intensity (heavier on weekends night, or specific times)
                                                let intensity = Math.random();
                                                if (dayIdx >= 4 && timeIdx === 3) intensity += 0.5; // Friday/Sat night
                                                if (dayIdx === 2 && timeIdx === 2) intensity += 0.8; // Specific spike

                                                let bgColor = 'bg-blue-50';
                                                if (intensity > 1.2) bgColor = 'bg-red-400';
                                                else if (intensity > 0.8) bgColor = 'bg-blue-400';
                                                else if (intensity > 0.4) bgColor = 'bg-blue-200';

                                                return (
                                                    <div
                                                        key={timeIdx}
                                                        className={`${bgColor} rounded-sm hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer group relative`}
                                                    >
                                                        {/* Tooltip on hover */}
                                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
                                                            평균 {Math.floor(intensity * 5)}건 발생
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Cameras Area */}
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

                </div>
            </main>
        </div>
    );
};

// Sub-components for cleaner code
const KpiCard = ({ title, value, unit, trend, trendUp, icon, color, alert }) => (
    <div className={`bg-white rounded-xl shadow-sm border ${alert ? 'border-red-200' : 'border-slate-200'} p-5 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${alert ? 'bg-red-500' : 'bg-transparent'}`}></div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                {icon}
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <div className="mt-3 text-xs flex items-center">
            {trendUp === true && <span className="text-red-500 font-medium mr-1">↑</span>}
            {trendUp === false && <span className="text-blue-500 font-medium mr-1">↓</span>}
            {trendUp === null && <span className="text-slate-400 mr-1">-</span>}
            <span className={trendUp === true ? 'text-slate-600' : 'text-slate-500'}>{trend}</span>
        </div>
    </div>
);

const CameraRankItem = ({ rank, name, count, maxCount, alert }) => {
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

export default AegisDashboard;