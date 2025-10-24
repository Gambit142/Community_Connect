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

  const isPrevDisabled = pagination.currentPage === 1;
  const isNextDisabled = pagination.currentPage === pagination.totalPages;

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={isPrevDisabled}
        className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isPrevDisabled
            ? 'bg-gray-200 text-gray-500 border-gray-300'
            : 'bg-[#05213C] text-white border-[#05213C] hover:bg-white hover:text-[#05213C]'
        }`}
      >
        Previous
      </button>
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 border rounded-md transition-colors ${
            page === '...'
              ? 'cursor-default bg-gray-100 text-gray-500 border-gray-300'
              : page === pagination.currentPage
              ? 'bg-white text-[#05213C] border-[#05213C]'
              : 'bg-[#05213C] text-white border-[#05213C] hover:bg-white hover:text-[#05213C]'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={isNextDisabled}
        className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isNextDisabled
            ? 'bg-gray-200 text-gray-500 border-gray-300'
            : 'bg-[#05213C] text-white border-[#05213C] hover:bg-white hover:text-[#05213C]'
        }`}
      >
        Next
      </button>
    </div>
  );
}