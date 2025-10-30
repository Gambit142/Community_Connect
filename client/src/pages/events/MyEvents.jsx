import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyEvents, clearError } from '../../store/events/eventsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import EventDetailsModal from '../../components/EventDetailsModal.jsx';

export default function MyEvents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, pagination, loading, error, successMessage } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    dispatch(getMyEvents(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);

  // Auto-hide success message after 5s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handleEventClick = (event) => {
    if (event.status === 'Published') {
      navigate(`/events/${event._id}`);
    } else {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  if (loading) return <div className="text-center py-8">Loading your events...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">My Events</h1>

          {/* Success Message from Location State */}
          {location.state?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {location.state.success}
            </div>
          )}

          {/* Success Message from Redux */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {successMessage}
            </div>
          )}

          {/* My Created Events Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">My Created Events</h2>
            
            {/* Status Filter */}
            <div className="mb-4">
              <label className="mr-2">Filter by Status:</label>
              <select 
                value={filters.status || ''} 
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="">All</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Events List */}
            <div className="grid gap-6">
              {events.length === 0 ? (
                <p className="text-gray-500">No events found. <button onClick={() => navigate('/events/create')} className="text-blue-500 underline">Create one now!</button></p>
              ) : (
                events.map(event => (
                  <div key={event._id} className="border rounded p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleEventClick(event)}>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.description.substring(0, 100)}...</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{event.category} • {new Date(event.date).toLocaleDateString()} at {event.time}</span>
                      <span>Status: <span className={`font-semibold ${event.status === 'Published' ? 'text-green-600' : event.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{event.status}</span></span>
                    </div>
                    {event.price > 0 && <p className="text-sm mt-1">Price: ${event.price}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex justify-center space-x-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded ${page === filters.page ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Registered Events Section (Placeholder - to be implemented later) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Registered Events</h2>
            <p className="text-gray-500 italic">This section will display events you have registered for (coming soon).</p>
            {/* Placeholder list - replace with actual fetch later */}
            <div className="grid gap-6 mt-4">
              {/* Example empty state */}
              <div className="border rounded p-4 text-center text-gray-500">
                No registered events yet. Browse events and sign up!
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/events/create')} className="bg-black text-white mt-4 py-2 px-4 rounded hover:bg-gray-800">
            Create New Event
          </button>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal 
        event={selectedEvent} 
        onClose={handleCloseModal}
        showEditButton={selectedEvent?.status === 'Rejected'}
      />
    </>
  );
}