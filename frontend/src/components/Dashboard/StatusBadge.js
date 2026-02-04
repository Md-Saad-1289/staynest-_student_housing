import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const statusStyles = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    verified: 'bg-green-50 text-green-700 border-green-200',
    unverified: 'bg-gray-50 text-gray-700 border-gray-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const icons = {
    pending: 'fas fa-clock',
    accepted: 'fas fa-check-circle',
    rejected: 'fas fa-times-circle',
    completed: 'fas fa-check-double',
    verified: 'fas fa-shield-alt',
    unverified: 'fas fa-exclamation-circle',
    active: 'fas fa-check-circle',
    inactive: 'fas fa-ban',
  };

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1',
    md: 'text-sm px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-full ${
        statusStyles[status] || statusStyles.pending
      } ${sizeClasses[size]}`}
    >
      <i className={`${icons[status]} text-xs`}></i>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
