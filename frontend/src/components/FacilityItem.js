import React from 'react';

const FACILITY_ICONS = {
  wifi: 'fa-wifi',
  attachedBathroom: 'fa-bath',
  cctv: 'fa-camera',
  studyTable: 'fa-desk',
  ac: 'fa-snowflake',
  fan: 'fa-fan',
  electricity: 'fa-bolt',
  water: 'fa-faucet-drip',
  meals: 'fa-utensils',
  parking: 'fa-parking',
};

export const FacilityItem = ({ label, available = true }) => {
  const facilityKey = label.toLowerCase().replace(/\s+/g, '');
  const iconClass = FACILITY_ICONS[facilityKey] || 'fa-check';

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
      available 
        ? 'bg-green-50 border-green-200 hover:border-green-400' 
        : 'bg-gray-50 border-gray-200 opacity-50'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
        available ? 'bg-green-200 text-green-700' : 'bg-gray-300 text-gray-500'
      }`}>
        <i className={`fas ${iconClass}`}></i>
      </div>
      <div className="flex-1">
        <span className={`text-sm font-semibold ${available ? 'text-gray-900' : 'text-gray-500'}`}>
          {label}
        </span>
      </div>
      {available && (
        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
          <i className="fas fa-check-circle"></i> Available
        </span>
      )}
    </div>
  );
};

export default FacilityItem;
