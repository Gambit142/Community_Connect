import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../store/events/eventsSlice'; 
import styles from '../../assets/css/EventsIndex.module.css';
import SidebarFilter from '../../components/SidebarFilter.jsx';
import Pagination from '../../components/Pagination.jsx';

const LocationIcon = () => (
    <svg className={styles.cardLocationIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const [filters, setFilters] = useState({ search: '', category: '', tags: '', page: 1, limit: 6 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getEvents(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className={styles.eventsIndexContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          {/* Desktop Sidebar */}
          <div className={styles.sidebarDesktopContainer}>
            <SidebarFilter
              searchValue={filters.search}
              onSearchChange={(e) => handleFilterChange('search', e.target.value)}
              tagsValue={filters.tags}
              onTagsChange={(e) => handleFilterChange('tags', e.target.value)}
              category={filters.category}
              onCategoryChange={(value) => handleFilterChange('category', value)}
            />
          </div>

          <div className={styles.sidebarMobileContainer}>
            <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {showFilters && (
              <div className={styles.filterContainer}>
                <SidebarFilter
                  searchValue={filters.search}
                  onSearchChange={(e) => handleFilterChange('search', e.target.value)}
                  tagsValue={filters.tags}
                  onTagsChange={(e) => handleFilterChange('tags', e.target.value)}
                  category={filters.category}
                  onCategoryChange={(value) => handleFilterChange('category', value)}
                />
              </div>
            )}
          </div>

          {/* Events Grid */}
          <div>
            {events.length === 0 && !loading ? (
              <div className={styles.noEventsContainer}>
                <p className={styles.noEventsText}>No events found. Try adjusting your filters or check back later!</p>
                <button
                  onClick={() => navigate('/events/create')}
                  className={`${styles.createButton} bg-[#05213C] text-white hover:bg-white hover:text-[#05213C] border border-[#05213C] px-6 py-2 rounded-md transition-colors`}
                >
                  Host First Event
                </button>
              </div>
            ) : (
              <div className={styles.eventsGrid}>
                {events.map((event) => {
                  const { month, day } = formatDate(event.date);
                  return (
                    <div key={event._id} className={styles.eventCard}>
                      <div className={styles.cardImageContainer}>
                        <img src={event.image || event.images?.[0]} alt={event.title} className={styles.cardImage} />
                        <div className={styles.cardDateBadge}>
                          <span className={styles.dateMonth}>{month}</span>
                          <span className={styles.dateDay}>{day}</span>
                        </div>
                      </div>
                      <div className={styles.cardContent}>
                        <p className={styles.cardCategory}>{event.category}</p>
                        <h3 className={styles.cardTitle}>{event.title}</h3>
                        <div className={styles.cardLocation}>
                          <LocationIcon />
                          <span>{event.location}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className={`${styles.cardButton} bg-[#05213C] text-white hover:bg-white hover:text-[#05213C] border border-[#05213C] w-full mt-4 py-2 rounded-md transition-colors`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && (
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>
      {loading && <div className="text-center mt-8">Loading events...</div>}
    </div>
  );
}