import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../store/events/eventsSlice';
import Pagination from '../../components/Pagination.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const LocationIcon = () => (
    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    month: date.toLocaleString('default', { month: 'short' }),
    day: date.getDate(),
  };
};

export default function EventsIndex() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events, pagination, loading, error } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({ search: '', category: '', page: 1, limit: 6 });
  const [searchInput, setSearchInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const debounceRef = useRef(null);

  // Event categories
  const eventCategories = [
    { value: '', label: 'All Categories' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Volunteer', label: 'Volunteer' },
    { value: 'Market', label: 'Market' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Charity', label: 'Charity' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Social', label: 'Social' },
    { value: 'Other', label: 'Other' },
  ];

  // Debounced function for search
  const debouncedSearch = useCallback((searchValue) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
    }, 600);
  }, []);

  useEffect(() => {
    dispatch(getEvents(filters));
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [dispatch, filters.search, filters.category, filters.page]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleCategoryChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, category: value, page: 1 }));
    setShowCategoryDropdown(false);
  }, []);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getCurrentCategoryLabel = () => {
    const category = eventCategories.find(cat => cat.value === filters.category);
    return category ? category.label : 'All Categories';
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', category: '', page: 1, limit: 6 });
  };

  const hasActiveFilters = filters.search || filters.category;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Events</h1>
            <p className="text-gray-600">Discover and join amazing events in your community</p>
          </div>
          <button 
            onClick={() => navigate('/events/create')} 
            className="bg-[#05213C] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            Create Event
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full md:w-64">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                  <span>{getCurrentCategoryLabel()}</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {eventCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        filters.category === cat.value ? 'bg-[#05213C] text-white' : 'text-gray-700'
                      } ${cat.value === '' ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        filters.category === cat.value ? 'bg-white' : 'bg-gray-300'
                      }`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button 
                    onClick={() => {
                      setSearchInput('');
                      setFilters(prev => ({ ...prev, search: '' }));
                    }}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Category: {getCurrentCategoryLabel()}
                  <button 
                    onClick={() => handleCategoryChange('')}
                    className="ml-2 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05213C] mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or clear filters to see more events."
                    : "Be the first to host an event in your community!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {hasActiveFilters ? (
                    <button 
                      onClick={clearFilters}
                      className="bg-[#05213C] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <button 
                    onClick={() => navigate('/events/create')} 
                    className="border border-[#05213C] text-[#05213C] px-6 py-3 rounded-lg hover:bg-[#05213C] hover:text-white transition-colors"
                  >
                    Host First Event
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{events.length}</span> of{' '}
                  <span className="font-semibold">{pagination.totalEvents}</span> events
                </p>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {events.map((event) => {
                  const { month, day } = formatDate(event.date);
                  return (
                    <div key={event._id} className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100">
                      {/* Fixed height image container */}
                      <div className="h-64 w-full overflow-hidden relative">
                        {event.images && event.images.length > 0 ? (
                          <img 
                            src={event.images[0]} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-4xl" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg text-center w-14 py-2">
                          <div className="text-[#05213C] font-bold text-sm uppercase tracking-wide">{month}</div>
                          <div className="text-gray-800 font-bold text-xl">{day}</div>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Category badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.category === 'Workshop' ? 'bg-red-100 text-red-800' :
                            event.category === 'Volunteer' ? 'bg-blue-100 text-blue-800' :
                            event.category === 'Market' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.category}
                          </span>
                        </div>

                        {/* Fixed height title section */}
                        <div className="mb-4 flex items-start">
                          <h3 className="text-xl font-bold text-[#05213C] line-clamp-2 w-full leading-tight">
                            {event.title}
                          </h3>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-6 mt-auto">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="line-clamp-1 text-sm">{event.location}</span>
                        </div>

                        {/* Button at the bottom */}
                        <button
                          className="w-full bg-[#05213C] text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-md hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!loading && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}