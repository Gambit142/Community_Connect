import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileCsv, faFilePdf, faFileExcel, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { exportAnalytics, clearExportState } from '../../store/admin/adminSlice';

const ExportButton = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const { exportLoading, exportError, exportSuccess } = useSelector((state) => state.admin);

  const handleExport = (format) => {
    dispatch(exportAnalytics({ format }));
    setShowDropdown(false);
  };

  const exportOptions = [
    { format: 'csv', label: 'CSV', icon: faFileCsv, color: 'text-green-600' },
    { format: 'pdf', label: 'PDF', icon: faFilePdf, color: 'text-red-600' },
    { format: 'xlsx', label: 'Excel', icon: faFileExcel, color: 'text-green-600' },
  ];

  // Clear state on unmount or after delay
  React.useEffect(() => {
    if (exportSuccess || exportError) {
      const timer = setTimeout(() => dispatch(clearExportState()), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess, exportError, dispatch]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={exportLoading}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {exportLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
        )}
        <span>{exportLoading ? 'Exporting...' : 'Export Data'}</span>
      </button>

      {/* Success/Error Toast */}
      {exportSuccess && (
        <div className="absolute right-0 mt-2 top-full bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm shadow-lg z-10 animate-in fade-in-0 slide-in-from-top-2">
          <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
          {exportSuccess}
        </div>
      )}
      {exportError && (
        <div className="absolute right-0 mt-2 top-full bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm shadow-lg z-10 animate-in fade-in-0 slide-in-from-top-2">
          {exportError}
        </div>
      )}

      {showDropdown && !exportLoading && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in-0 zoom-in-95">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3 group"
              >
                <FontAwesomeIcon 
                  icon={option.icon} 
                  className={`h-4 w-4 ${option.color} group-hover:scale-110 transition-transform duration-200`}
                />
                <span className="text-sm font-medium text-gray-700">
                  Export as {option.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;