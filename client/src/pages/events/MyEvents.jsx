import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyEvents, clearError, deleteEvent } from '../../store/events/eventsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import EventDetailsModal from '../../components/EventDetailsModal.jsx';
import RegisteredEvents from '../../components/RegisteredEvents.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faCalendarPlus,
  faFilter,
  faCalendarCheck,
  faLocationDot,
  faUsers,
  faClock,
  faBan,
} from '@fortawesome/free-solid-svg-icons';

export default function MyEvents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { events: createdEvents, pagination, loading, error, successMessage } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 });
  const [activeTab, setActiveTab] = useState('created');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (activeTab === 'created') {
      dispatch(getMyEvents(filters));
    }
    return () => dispatch(clearError());
  }, [dispatch, filters, activeTab]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

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

  const cancelDelete = () => setDeleteConfirm(null);
  const confirmDelete = async () => {
    try {
      await dispatch(deleteEvent(deleteConfirm)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = (status, rejectionReason) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Published':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
          Published
        </span>;
      case 'Pending Approval':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <FontAwesomeIcon icon={faClock} className="mr-1 w-3 h-3" />
          Pending
        </span>;
      case 'Rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <FontAwesomeIcon icon={faBan} className="mr-1 w-3 h-3" />
          Rejected
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  if (loading && activeTab === 'created') {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Manage your created events and view registrations.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('created')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'created' ? 'border-[#05213C] text-[#05213C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Created Events
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`ml-8 pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'registered' ? 'border-[#05213C] text-[#05213C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Registered Events
          </button>
        </div>

        {/* Created Events Tab */}
        {activeTab === 'created' && (
          <div>
            {/* Header with Filters */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/events/create')}
                  className="bg-[#05213C] text-white px-4 py-2 rounded-lg hover:bg-[#041a2f] transition-colors flex items-center space-x-2 text-sm"
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                  <span>Create New Event</span>
                </button>
                <div className="relative">
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#05213C] text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending Approval">Pending</option>
                    <option value="Published">Published</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <FontAwesomeIcon icon={faFilter} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {pagination?.totalEvents > 0 && (
                <p className="text-sm text-gray-600">
                  Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalEvents)} of {pagination.totalEvents} events
                </p>
              )}
            </div>

            {/* Events Table */}
            <div className="space-y-6">
              {createdEvents.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {createdEvents.map((event) => (
                          <tr 
                            key={event._id}
                            className={`hover:bg-gray-50 transition-colors ${event.status === 'Rejected' ? 'opacity-60' : 'cursor-pointer'}`}
                            onClick={() => handleEventClick(event)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <div className={`text-sm font-medium ${event.status === 'Rejected' ? 'text-gray-500' : 'text-gray-900'} line-clamp-2`}>
                                  {event.title}
                                </div>
                                {event.description && (
                                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {event.description}
                                  </div>
                                )}
                                {event.status === 'Rejected' && event.rejectionReason && (
                                  <div className="text-sm text-red-600 mt-1 italic">
                                    Reason: {event.rejectionReason}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 space-y-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faCalendarCheck} className="mr-2 text-[#05213C] w-4 h-4" />
                                  {new Date(event.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[#05213C] w-4 h-4" />
                                  <span className="text-gray-600">{event.location}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <FontAwesomeIcon icon={faUsers} className="mr-2 text-[#05213C] w-4 h-4" />
                                {event.attendees?.length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(event.status, event.rejectionReason)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => handleEditEvent(event, e)}
                                  disabled={event.status === 'Rejected'}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={(e) => handleDeleteEvent(event, e)}
                                  className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCalendarPlus} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Created Events Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first event to get started.</p>
                  <button
                    onClick={() => navigate('/events/create')}
                    className="bg-[#05213C] text-white px-6 py-2 rounded-lg hover:bg-[#041a2f] transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(filters.page * filters.limit, pagination.totalEvents)}</span> of{' '}
                    <span className="font-medium">{pagination.totalEvents}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registered Events Tab */}
        {activeTab === 'registered' && <RegisteredEvents />}
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