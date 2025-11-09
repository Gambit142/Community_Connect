// File: pages/admin/Events.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCog,
  faCheck,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { getPendingEvents, approveEvent, rejectEvent, setEventFilters, clearEventError } from '../../store/admin/adminSlice.js';

export default function Events() {
  const dispatch = useDispatch();
  const { events, eventPagination, eventLoading, eventError, eventFilters } = useSelector((state) => state.admin);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [rejectReason, setRejectReason] = useState(''); 
  const [showRejectModal, setShowRejectModal] = useState(false); 
  const [rejectEventId, setRejectEventId] = useState(null); 
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setSearchInput(eventFilters.search || '');
    dispatch(clearEventError());
    dispatch(getPendingEvents({ page: 1 })); // Initial load
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch, eventFilters.search]);

  const handleSearch = useCallback((e) => {
    const search = e.target.value;
    setSearchInput(search);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setEventFilters({ search, page: 1 }));
      dispatch(getPendingEvents({ search, page: 1 }));
    }, 600); // Debounce 600ms
  }, [dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(setEventFilters({ page }));
    dispatch(getPendingEvents({ ...eventFilters, page })); // Pass current filters + new page
  };

  const handleApprove = (eventId) => {
    dispatch(approveEvent(eventId)).then(() => {
      dispatch(getPendingEvents({ ...eventFilters, page: currentPage })); // Refetch current page
    });
  };

  const handleReject = (eventId) => {
    setRejectEventId(eventId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    dispatch(rejectEvent({ eventId: rejectEventId, reason: rejectReason })).then(() => {
      setShowRejectModal(false);
      setRejectReason('');
      dispatch(getPendingEvents({ ...eventFilters, page: currentPage })); // Refetch current page
    });
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  if (eventLoading) {
    return <div className="flex justify-center items-center h-64">Loading events...</div>;
  }

  if (eventError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {eventError}</p>
        <button onClick={() => dispatch(clearEventError())} className="mt-2 text-blue-600 underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pending Events ({eventPagination?.totalEvents || 0})</h1>
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchInput}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending events found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.date).toLocaleDateString()} {event.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{event.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${event.price > 0 ? event.price : 'Free'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.images?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleApprove(event._id)}
                        className="text-green-600 hover:text-green-900 ml-2"
                        title="Approve"
                        disabled={eventLoading}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={() => handleReject(event._id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                        title="Reject"
                        disabled={eventLoading}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {eventPagination && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: eventPagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-[#05213C] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">Reject Event</h2>
              <p className="mb-4 text-gray-600">Please provide a reason for rejection:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={500}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectConfirm(rejectEventId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><strong>Category:</strong> {selectedEvent.category}</div>
                <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</div>
                <div><strong>Time:</strong> {selectedEvent.time}</div>
                {selectedEvent.price > 0 && <div><strong>Price:</strong> ${selectedEvent.price}</div>}
                <div><strong>Location:</strong> {selectedEvent.location}</div>
              </div>
              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {selectedEvent.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Event" className="w-full h-20 object-cover rounded" />
                  ))}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}