import React from 'react';

export const StatCard = ({ icon, label, value, subtext, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-md',
    green: 'from-green-50 to-green-100 text-green-700 border-green-200 shadow-md',
    orange: 'from-orange-50 to-orange-100 text-orange-700 border-orange-200 shadow-md',
    purple: 'from-purple-50 to-purple-100 text-purple-700 border-purple-200 shadow-md',
    red: 'from-red-50 to-red-100 text-red-700 border-red-200 shadow-md',
  };

  const iconBgClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className={`p-6 rounded-xl border bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-600 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${iconBgClasses[color]} flex items-center justify-center text-2xl text-white shadow-lg`}>
          <i className={icon}></i>
        </div>
      </div>
      {trend && Array.isArray(trend) && trend.length > 1 && (
        <div className="mt-3">
          <Sparkline data={trend} colorClass={color} />
        </div>
      )}
    </div>
  );
};

  const Sparkline = ({ data = [], colorClass = 'blue' }) => {
    const width = 120;
    const height = 32;
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="block">
        <polyline fill="none" stroke="#cbd5e1" strokeWidth="1" points={points} />
        <polyline fill="none" stroke="#1e40af" strokeWidth="2" points={points} />
      </svg>
    );
  };