import React from 'react';

export const DataTable = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center text-gray-500">
        <i className="fas fa-spinner fa-spin text-2xl mb-2 sm:mb-3 block"></i>
        <p className="text-sm sm:text-base">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center text-gray-500">
        <i className="fas fa-inbox text-2xl sm:text-3xl mb-2 sm:mb-3 block opacity-30"></i>
        <p className="text-sm sm:text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-3 sm:p-4">
        {data.map((row, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2.5 bg-white hover:border-blue-300 hover:shadow-md transition-all">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-start gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase flex-shrink-0 max-w-[40%]">
                  {col.label}
                </span>
                <div className="text-sm text-gray-900 text-right font-medium flex-1 min-w-0">
                  {col.render ? col.render(row) : row[col.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};