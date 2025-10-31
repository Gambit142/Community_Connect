import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../store/events/eventsSlice';
import SidebarFilter from '../../components/SidebarFilter.jsx';
import Pagination from '../../components/Pagination.jsx';

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
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

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
  }, []);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
          <button 
            onClick={() => navigate('/events/create')} 
            className="bg-[#05213C] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Create Event
          </button>
        </div>

        {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block h-full">
            <SidebarFilter 
              searchValue={searchInput}
              onSearchChange={handleSearchChange}
              tagsValue=""
              onTagsChange={() => {}}
              category={filters.category}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Mobile Toggle Button and Filters */}
          <div className="lg:hidden mb-4">
            <button
              onClick={toggleFilters}
              className="text-black font-medium mb-2 flex items-center gap-2"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <SidebarFilter 
                  searchValue={searchInput}
                  onSearchChange={handleSearchChange}
                  tagsValue=""
                  onTagsChange={() => {}}
                  category={filters.category}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            )}
          </div>

          {/* Events Grid */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05213C] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading events...</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No events found. Try adjusting filters.</p>
                <button 
                  onClick={() => navigate('/events/create')} 
                  className="bg-[#05213C] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Host First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {events.map((event) => {
                  const { month, day } = formatDate(event.date);
                  return (
                    <div key={event._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                      {/* Fixed height image container */}
                      <div className="h-64 w-full overflow-hidden relative">
                        {event.images && event.images.length > 0 ? (
                          <img 
                            src={event.images[0]} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md text-center w-12">
                          <div className="text-[#05213C] font-bold text-sm uppercase">{month}</div>
                          <div className="text-gray-800 font-bold text-lg">{day}</div>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        {/* Category badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            event.category === 'Workshop' ? 'bg-red-100 text-red-800' :
                            event.category === 'Volunteer' ? 'bg-blue-100 text-blue-800' :
                            event.category === 'Market' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.category}
                          </span>
                        </div>

                        {/* Fixed height title section */}
                        <div className="mb-3 flex items-start">
                          <h3 className="text-lg font-semibold text-[#05213C] line-clamp-2 w-full leading-tight">
                            {event.title}
                          </h3>
                        </div>

                        {/* Location - placed right above the button */}
                        <div className="flex items-center text-sm text-gray-600 mb-4 mt-auto">
                          <LocationIcon />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        {/* Button at the bottom */}
                        <button
                          className="w-full bg-[#05213C] text-white py-2 rounded-md hover:bg-gray-800 transition-colors mt-2"
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
          </div>
        </div>
      </div>
    </div>
  );
}