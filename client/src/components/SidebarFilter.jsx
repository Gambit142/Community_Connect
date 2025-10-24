import React from 'react';

export default function SidebarFilter({ 
  searchValue, 
  onSearchChange, 
  tagsValue, 
  onTagsChange, 
  category, 
  onCategoryChange 
}) {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'ridesharing', label: 'Ridesharing' },
    { value: 'housing', label: 'Housing' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'goods', label: 'Goods' },
    { value: 'events', label: 'Events' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'financial', label: 'Financial' },
  ];

  return (
    <div className="bg-[#33383e] shadow-lg rounded-lg p-6 text-white h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Filters</h3>
        <input
          type="text"
          placeholder="Search by title, description, or location..."
          value={searchValue}
          onChange={onSearchChange}
          className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-400"
        />
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium mb-3 text-white">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={category === cat.value}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-4 w-4 border-gray-300 focus:ring-[#33383e] text-[#33383e] cursor-pointer"
              />
              <span className="text-sm text-[#969ba2]">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3 text-white">Tags (comma-separated)</h4>
        <input
          type="text"
          placeholder="e.g., free, urgent"
          value={tagsValue}
          onChange={onTagsChange}
          className="w-full p-2 border border-gray-600 rounded-md bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}