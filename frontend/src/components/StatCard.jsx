import React from 'react';

const StatCard = ({ label, value, icon, color = 'amber' }) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    blue:  'bg-sky-50 text-sky-600',
    green: 'bg-emerald-50 text-emerald-600',
    rose:  'bg-rose-50 text-rose-600',
  };

  return (
    <div className="card p-6 flex items-center gap-5">
      {/* Icon bubble */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colors[color] || colors.amber}`}>
        {icon}
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-gray-900">
          {value !== null && value !== undefined ? value.toLocaleString() : '—'}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
