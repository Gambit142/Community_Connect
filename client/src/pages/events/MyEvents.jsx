// src/pages/events/MyEvents.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '../../assets/css/MyEvents.module.css';

// MOCK DATA - Replace with Redux state later
const mockMyEvents = [
  { _id: 'e1', title: 'My Awesome Tech Talk', date: '2025-12-10T19:00:00Z', location: 'Online', status: 'Pending Approval', type: 'created' },
  { _id: 'e2', title: 'Charity Bake Sale', date: '2025-11-30T10:00:00Z', location: 'Community Center', status: 'Published', type: 'created' },
  { _id: 'e3', title: 'Community Garden Workshop', date: '2025-11-05T14:00:00Z', location: 'Central Park', status: 'Attending', type: 'registered' },
  { _id: 'e4', title: 'Local Farmers Market', date: '2025-11-15T11:00:00Z', location: 'Downtown Square', status: 'Attending', type: 'registered' },
];

export default function MyEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [allEvents] = useState(mockMyEvents); // This would come from Redux
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'created', 'registered'
  const [loading, setLoading] = useState(true);
  
  // Handle success message from navigation (e.g., after creating an event)
  const [successMessage, setSuccessMessage] = useState(location.state?.success || null);

  // Filter events based on the active filter
  useEffect(() => {
    setLoading(true);
    let eventsToShow = [];
    if (activeFilter === 'all') {
      eventsToShow = allEvents;
    } else {
      eventsToShow = allEvents.filter(event => event.type === activeFilter);
    }
    setTimeout(() => { // Simulate loading
      setFilteredEvents(eventsToShow);
      setLoading(false);
    }, 300);
  }, [activeFilter, allEvents]);
  
  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      // Clean up the timer when the component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>My Events</h1>
        
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <div className={styles.card}>
          <div className={styles.filterBar}>
            <button 
              onClick={() => handleFilterChange('all')} 
              className={`${styles.filterButton} ${activeFilter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive}`}
            >
              All My Events
            </button>
            <button 
              onClick={() => handleFilterChange('created')} 
              className={`${styles.filterButton} ${activeFilter === 'created' ? styles.filterButtonActive : styles.filterButtonInactive}`}
            >
              Created by Me
            </button>
            <button 
              onClick={() => handleFilterChange('registered')} 
              className={`${styles.filterButton} ${activeFilter === 'registered' ? styles.filterButtonActive : styles.filterButtonInactive}`}
            >
              Registered
            </button>
          </div>

          {loading ? (
            <div className="text-center p-8">Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <div className={styles.noEventsContainer}>
              <p className={styles.noEventsText}>
                You have no events in this category.
              </p>
              <Link to="/events" className={styles.link}>Find an event to attend</Link> or <Link to="/events/create" className={styles.link}>create your own</Link>.
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.th}>Event Title</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Location</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdTitle}`}>{event.title}</td>
                      <td className={`${styles.td} ${styles.tdText}`}>{formatDate(event.date)}</td>
                      <td className={`${styles.td} ${styles.tdText}`}>{event.location}</td>
                      <td className={styles.td}>
                        <span className={`${styles.statusBadge} ${
                          event.type === 'created' ? (event.status === 'Published' ? styles.statusCreated : styles.statusPending) : styles.statusRegistered
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/events/create')} className={styles.createButton}>
          Create New Event
        </button>
      </div>
    </div>
  );
}