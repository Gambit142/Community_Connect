import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyEvents, clearError, deleteEvent } from '../../store/events/eventsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import EventDetailsModal from '../../components/EventDetailsModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faCalendarPlus, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
export default function MyEvents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, pagination, loading, error, successMessage } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  useEffect(() => {
    dispatch(getMyEvents(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);
  // Auto-hide success message after 6s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);
  // Auto-hide location.state success message after 6s
  useEffect(() => {
    if (location.state?.success) {
      const timer = setTimeout(() => {
        navigate('.', { replace: true, state: null });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.success, navigate]);
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
  const handleEditEvent = (event, e) => {
    e.stopPropagation();
    navigate(`/events/edit/${event._id}`);
  };
  const handleDeleteEvent = (event, e) => {
    e.stopPropagation();
    setDeleteConfirm(event._id);
  };
  const confirmDelete = () => {
    if (deleteConfirm) {
      dispatch(deleteEvent(deleteConfirm));
      setDeleteConfirm(null);
    }
  };
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05213C] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your events...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="text-red-600 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Events</h3>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#05213C] mb-2">My Events</h1>
            <p className="text-gray-600">Manage and track your created events</p>
          </div>
          {/* Success Messages */}
          {location.state?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700">{location.state.success}</span>
            </div>
          )}
          {successMessage && !location.state?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}
          {/* My Created Events Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#05213C] mb-2">My Created Events</h2>
                <p className="text-gray-600">Events you've created and their current status</p>
              </div>
              <button
                onClick={() => navigate('/events/create')}
                className="mt-4 sm:mt-0 bg-[#05213C] text-white px-6 py-3 rounded-lg hover:bg-[#041a2f] transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                Create New Event
              </button>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-[#05213C] transition-colors"
              >
                <option value="">All Events</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            {/* Events Grid */}
            <div className="grid gap-4">
              {events.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No events found matching your criteria.</p>
                  <button
                    onClick={() => navigate('/events/create')}
                    className="text-[#05213C] hover:text-[#041a2f] font-semibold underline"
                  >
                    Create your first event!
                  </button>
                </div>
              ) : (
                events.map(event => (
                  <div
                    key={event._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#05213C] transition-colors">
                            {event.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {event.category}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {event.time}
                          </span>
                          <span className={`flex items-center font-semibold ${event.price > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            <FontAwesomeIcon
                              icon={event.price > 0 ? '' : faTicketAlt}
                              className="w-4 h-4 mr-1"
                            />
                            {event.price > 0 ? `$${event.price}` : 'Free'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-4">
                        <button
                          onClick={(e) => handleEventClick(event)}
                          className="p-2 text-gray-400 hover:text-[#05213C] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        <button
                          onClick={(e) => handleEditEvent(event, e)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>

                        <button
                          onClick={(e) => handleDeleteEvent(event, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${page === filters.page
                        ? 'bg-[#05213C] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {/* Registered Events Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-[#05213C] mb-4">Registered Events</h2>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Registered Events Yet</h3>
              <p className="text-gray-500 mb-4">Browse events and register to see them here.</p>
              <button
                onClick={() => navigate('/events')}
                className="text-[#05213C] hover:text-[#041a2f] font-semibold underline"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseModal}
        showEditButton={selectedEvent?.status === 'Rejected'}
      />
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faTrash} className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                <p className="text-gray-600">Are you sure you want to delete this event?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}