import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRegisteredEvents } from '../store/events/eventsSlice.js';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faLocationDot, faUsers, faTicketAlt, faEye } from '@fortawesome/free-solid-svg-icons';

export default function RegisteredEvents({ page: initialPage = 1, limit: initialLimit = 10 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registeredEvents, paginationRegistered, loadingRegistered, errorRegistered } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({ page: initialPage, limit: initialLimit });

  useEffect(() => {
    dispatch(getRegisteredEvents(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loadingRegistered) {
    return <div className="text-center py-8">Loading registered events...</div>;
  }

  if (errorRegistered) {
    return <div className="text-center py-8 text-red-500">Error: {errorRegistered}</div>;
  }

  return (
    <div className="space-y-6">
      {registeredEvents.length > 0 ? (
        <>
          {/* Table Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Event Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Date & Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registeredEvents.map((event) => (
                    <tr 
                      key={event._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-0"> {/* Added min-w-0 for proper truncation */}
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          {event.description && (
                            <div className="text-sm text-gray-500 mt-1 truncate">
                              {truncateText(event.description, 80)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-[#05213C] w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[#05213C] w-4 h-4 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{event.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.price > 0 ? (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faTicketAlt} className="mr-2 text-[#05213C] w-4 h-4 flex-shrink-0" />
                            <span>${event.price}</span>
                          </div>
                        ) : (
                          <span className="text-green-600 font-medium">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FontAwesomeIcon icon={faUsers} className="mr-1 w-3 h-3 flex-shrink-0" />
                          Confirmed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event._id}`);
                          }}
                          className="text-[#05213C] hover:text-[#041a2f] font-semibold flex items-center space-x-1"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4 flex-shrink-0" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {paginationRegistered?.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((paginationRegistered.currentPage - 1) * filters.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(paginationRegistered.currentPage * filters.limit, paginationRegistered.totalItems)}</span> of{' '}
                <span className="font-medium">{paginationRegistered.totalItems}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(paginationRegistered.currentPage - 1)}
                  disabled={paginationRegistered.currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {paginationRegistered.currentPage} of {paginationRegistered.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(paginationRegistered.currentPage + 1)}
                  disabled={paginationRegistered.currentPage === paginationRegistered.totalPages}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faTicketAlt} className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Registered Events Yet</h3>
          <p className="text-gray-500 mb-4">Browse events and register to see them here.</p>
          <button
            onClick={() => navigate('/events')}
            className="text-[#05213C] hover:text-[#041a2f] font-semibold underline"
          >
            Browse Events
          </button>
        </div>
      )}
    </div>
  );
}