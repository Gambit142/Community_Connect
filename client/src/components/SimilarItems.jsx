import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faImage, faCalendarAlt, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const SimilarItems = ({ items, type, title = "Similar Items" }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const getCategoryColor = (category, itemType) => {
    if (itemType === 'post') {
      const postColors = {
        food: 'bg-red-100 text-red-800',
        tutoring: 'bg-blue-100 text-blue-800',
        housing: 'bg-green-100 text-green-800',
        jobs: 'bg-purple-100 text-purple-800',
        health: 'bg-pink-100 text-pink-800',
        education: 'bg-indigo-100 text-indigo-800',
        goods: 'bg-yellow-100 text-yellow-800',
        events: 'bg-teal-100 text-teal-800',
        transportation: 'bg-orange-100 text-orange-800',
        financial: 'bg-cyan-100 text-cyan-800'
      };
      return postColors[category] || 'bg-gray-100 text-gray-800';
    } else {
      const eventColors = {
        Workshop: 'bg-red-100 text-red-800',
        Volunteer: 'bg-blue-100 text-blue-800',
        Market: 'bg-green-100 text-green-800',
        Tech: 'bg-purple-100 text-purple-800',
        Charity: 'bg-pink-100 text-pink-800',
        Fair: 'bg-yellow-100 text-yellow-800',
        Social: 'bg-indigo-100 text-indigo-800',
        Other: 'bg-gray-100 text-gray-800'
      };
      return eventColors[category] || 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category, itemType) => {
    if (itemType === 'post') {
      const postIcons = {
        food: '🍕',
        tutoring: '📚',
        housing: '🏠',
        jobs: '💼',
        health: '🏥',
        education: '🎓',
        goods: '📦',
        events: '🎪',
        transportation: '🚗',
        financial: '💰'
      };
      return postIcons[category] || '📄';
    } else {
      const eventIcons = {
        Workshop: '🔧',
        Volunteer: '🤝',
        Market: '🛒',
        Tech: '💻',
        Charity: '❤️',
        Fair: '🎡',
        Social: '🎉',
        Other: '📅'
      };
      return eventIcons[category] || '📅';
    }
  };

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#05213C] inline-block border-b-2 border-[#05213C] pb-2">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.slice(0, 4).map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
            onClick={() => navigate(`/${type}s/${item._id}`)}
          >
            {/* Image */}
            <div className="h-48 w-full overflow-hidden relative">
              {item.images && item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FontAwesomeIcon icon={faImage} className="text-3xl mb-2 text-gray-400" />
                    <span className="text-sm block">No Image</span>
                  </div>
                </div>
              )}
              
              {/* Quick action overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black bg-opacity-50 text-white rounded-full p-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3 min-h-[2rem] items-start">
                <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getCategoryColor(item.category, type)}`}>
                  <span className="text-xs">{getCategoryIcon(item.category, type)}</span>
                  {item.category}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                  {item.price > 0 ? `${item.price}` : 'Free'}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-[#05213C] line-clamp-2 mb-2 leading-tight min-h-[2.5rem] group-hover:text-blue-700 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                {item.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                  {type === 'event' 
                    ? new Date(item.date).toLocaleDateString()
                    : new Date(item.createdAt).toLocaleDateString()
                  }
                </span>
                <div className="flex items-center space-x-3">
                  {item.likeCount > 0 && (
                    <span className="flex items-center space-x-1 text-red-500">
                      <FontAwesomeIcon 
                        icon={item.isLiked ? faHeart : faHeartRegular} 
                        className="w-3 h-3" 
                      />
                      <span>{item.likeCount}</span>
                    </span>
                  )}
                  {item.commentCount > 0 && (
                    <span className="flex items-center space-x-1 text-blue-500">
                      <FontAwesomeIcon icon={faComment} className="w-3 h-3" />
                      <span>{item.commentCount}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Hover action indicator */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-[#05213C] text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      {items.length > 4 && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(`/${type}s`)}
            className="inline-flex items-center gap-2 text-[#05213C] hover:text-blue-700 font-medium transition-colors"
          >
            <span>View All {type === 'post' ? 'Posts' : 'Events'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SimilarItems;
