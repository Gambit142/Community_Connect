import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages < 1) return null;

  const getVisiblePages = () => {
    if (pagination.totalPages <= 1) return [1]; // Single page: just 1, no duplicates

    const delta = 2;
    const range = [];
    for (let i = Math.max(2, pagination.currentPage - delta); i <= Math.min(pagination.totalPages - 1, pagination.currentPage + delta); i += 1) {
      range.push(i);
    }
    if (pagination.currentPage - delta > 2) {
      range.unshift('...');
    }
    if (pagination.currentPage + delta < pagination.totalPages - 1) {
      range.push('...');
    }
    range.unshift(1);
    range.push(pagination.totalPages);
    return range;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-[#05213C] text-white"
      >
        Previous
      </button>
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 border border-gray-300 rounded-md ${
            page === pagination.currentPage
              ? 'bg-[#05213C] text-white'
              : 'hover:bg-gray-50 bg-[#05213C] text-white'
          } ${page === '...' ? 'cursor-default bg-gray-100' : ''}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-[#05213C] text-white"
      >
        Next
      </button>
    </div>
  );
}