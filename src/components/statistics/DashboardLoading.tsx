import React from 'react';

export const DashboardLoading = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-32 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-10 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-80 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-48 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
          <div className="h-56 bg-slate-50 rounded-lg" />
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-80 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
          <div className="h-6 w-32 bg-slate-100 rounded mb-6" />
          <div className="flex justify-center items-center h-48">
            <div className="h-40 w-40 rounded-full border-8 border-slate-100" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-72 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
          <div className="h-6 w-32 bg-slate-100 rounded mb-6" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-50 rounded" />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-72 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
          <div className="h-6 w-32 bg-slate-100 rounded mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
                <div className="h-4 w-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
