// src/pages/events/EventsIndex.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/EventsIndex.module.css';
import SidebarFilter from '../../components/SidebarFilter.jsx'; // Reusing from posts
import Pagination from '../../components/Pagination.jsx'; // Reusing from posts

// MOCK DATA - Replace with Redux fetching later
const mockEvents = [
  { _id: '1', title: 'Community Garden Workshop', category: 'Workshop', location: 'Central Park Community Garden', date: '2025-11-05T14:00:00Z', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop' },
  { _id: '2', title: 'Neighborhood Cleanup Day', category: 'Volunteer', location: 'Meet at City Hall', date: '2025-11-12T09:00:00Z', image: 'https://images.unsplash.com/photo-1618479122201-cf6d52a236d7?q=80&w=2070&auto=format&fit=crop' },
  { _id: '3', title: 'Local Farmers Market', category: 'Market', location: 'Downtown Square', date: '2025-11-15T11:00:00Z', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=2070&auto=format&fit=crop' },
  { _id: '4', title: 'Tech Meetup: Intro to React', category: 'Tech', location: 'Online', date: '2025-11-20T18:30:00Z', image: 'https://images.unsplash.com/photo-1555066931-4365d1469c9b?q=80&w=2070&auto=format&fit=crop' },
  { _id: '5', title: 'Annual Charity Run 5K', category: 'Charity', location: 'Lakeside Path', date: '2025-11-22T08:00:00Z', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop' },
  { _id: '6', title: 'Holiday Craft Fair', category: 'Fair', location: 'Community Center', date: '2025-12-02T10:00:00Z', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop' },
];



const mockPagination = {
  currentPage: 1,
  totalPages: 2,
  totalItems: 12,

};

const LocationIcon = () => (
    <svg className={styles.cardLocationIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>

);


export default function EventsIndex() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', tags: '', page: 1, limit: 6 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      setEvents(mockEvents);
      setPagination(mockPagination);
      setLoading(false);
    }, 1000);
    
  }, [filters]);



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading events...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Community Events</h1>
          <button onClick={() => navigate('/events/create')} className={styles.createButton}>
            Create Event
          </button>
        </div>

        {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}

        <div className={styles.mainGrid}>
          {/* Sidebar Filters */}
          <div className={styles.sidebarDesktop}>
            <SidebarFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className={styles.sidebarMobileContainer}>
            <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {showFilters && (
              <div className={styles.filterContainer}>
                <SidebarFilter filters={filters} onFilterChange={handleFilterChange} />
              </div>
            )}
          </div>

          {/* Events Grid */}
          <div>
            {events.length === 0 && !loading ? (
              <div className={styles.noEventsContainer}>
                <p className={styles.noEventsText}>No events found. Try adjusting your filters or check back later!</p>
                <button onClick={() => navigate('/events/create')} className={styles.createButton}>Host First Event</button>
              </div>
            ) : (
              <div className={styles.eventsGrid}>
                {events.map((event) => {
                  const { month, day } = formatDate(event.date);
                  return (
                    <div key={event._id} className={styles.eventCard}>
                      <div className={styles.cardImageContainer}>
                        <img src={event.image} alt={event.title} className={styles.cardImage} />
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
                        <button onClick={() => navigate(`/events/${event._id}`)} className={styles.cardButton}>
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
    </div>
  );
}