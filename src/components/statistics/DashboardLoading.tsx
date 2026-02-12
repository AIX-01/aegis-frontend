import React from 'react';

export const DashboardLoading = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-100 h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-100 h-80 rounded-xl" />
        <div className="bg-slate-100 h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-100 h-72 rounded-xl" />
        <div className="bg-slate-100 h-72 rounded-xl" />
      </div>
    </div>
  );
};
