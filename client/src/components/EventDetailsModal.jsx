import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faClock, faMapMarkerAlt, faTag, faDollarSign, faEdit } from '@fortawesome/free-solid-svg-icons';
export default function EventDetailsModal({ event, onClose, showEditButton = false }) {
  const navigate = useNavigate();
  if (!event) return null;
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Pending Approval':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  const handleEdit = () => {
    navigate(`/events/edit/${event._id}`);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#05213C]">{event.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-500 text-lg" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
              Status: {event.status}
            </span>
          </div>
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#05213C] mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
          {/* Event Details Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faTag} className="text-[#05213C] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{event.category}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faCalendar} className="text-[#05213C] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faClock} className="text-[#05213C] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#05213C] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
            {event.price > 0 && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-green-600">${event.price}</p>
                </div>
              </div>
            )}
          </div>
          {/* Event Images */}
          {event.images && event.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#05213C] mb-3">Event Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {event.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Event ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {showEditButton && (
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-[#05213C] text-white rounded-lg hover:bg-[#041a2f] transition-colors"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit & Resubmit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}