import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, getSimilarEvents, clearCurrentEvent } from '../../store/events/eventsSlice';
import styles from '../../assets/css/EventDetails.module.css';

// SVG Icons
const CalendarIcon = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const ClockIcon = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const LocationIcon = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEvent: event, similarEvents, loading, error } = useSelector((state) => state.events);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryPosition, setGalleryPosition] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(23);

  // Comments state
  const [comments, setComments] = useState([
    { _id: 'c1', author: 'Jane Doe', avatarInitial: 'J', date: '2025-10-23T10:00:00Z', text: 'This looks amazing! I\'ve been wanting to learn more about composting. Will there be a Q&A session?' },
    { _id: 'c2', author: 'John Smith', avatarInitial: 'J', date: '2025-10-24T11:30:00Z', text: 'Count me in! Happy to bring some extra gloves for anyone who needs them.' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
      dispatch(getSimilarEvents(id));
    }
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [dispatch, id]);

  useEffect(() => {
    const updateThumbWidth = () => {
      if (window.innerWidth < 480) {
        setThumbWidth(48);
      } else if (window.innerWidth < 768) {
        setThumbWidth(31);
      } else {
        setThumbWidth(23);
      }
    };
    updateThumbWidth();
    window.addEventListener('resize', updateThumbWidth);
    return () => window.removeEventListener('resize', updateThumbWidth);
  }, []);

  const galleryConfig = useMemo(() => {
    if (!event?.images || event.images.length === 0) {
      return { leftMin: 0, leftMax: 0, numVisible: 0 };
    }
    const numThumbs = event.images.length;
    const totalWidth = numThumbs * thumbWidth;
    let leftMin, leftMax;
    if (totalWidth <= 100) {
      leftMin = 0;
      leftMax = 100 - totalWidth;
    } else {
      leftMin = 100 - totalWidth;
      leftMax = 0;
    }
    const numVisible = Math.floor(100 / thumbWidth);
    return { leftMin, leftMax, numVisible };
  }, [event?.images, thumbWidth]);

  useEffect(() => {
    const { leftMin, leftMax } = galleryConfig;
    if (event?.images && event.images.length > 0) {
      const activeCenter = activeImageIndex * thumbWidth + thumbWidth / 2;
      const targetPosition = 50 - activeCenter;
      const clampedPosition = Math.max(leftMin, Math.min(leftMax, targetPosition));
      setGalleryPosition(clampedPosition);
    }
  }, [activeImageIndex, galleryConfig, event?.images, thumbWidth]);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleNext = () => {
    if (event?.images) {
      const nextIndex = (activeImageIndex + 1) % event.images.length;
      setActiveImageIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (event?.images) {
      const prevIndex = (activeImageIndex - 1 + event.images.length) % event.images.length;
      setActiveImageIndex(prevIndex);
    }
  };

  const moveGalleryPrev = () => {
    const { leftMin, leftMax } = galleryConfig;
    const newPos = galleryPosition + thumbWidth;
    const clamped = Math.max(leftMin, Math.min(leftMax, newPos));
    setGalleryPosition(clamped);
  };

  const moveGalleryNext = () => {
    const { leftMin, leftMax } = galleryConfig;
    const newPos = galleryPosition - thumbWidth;
    const clamped = Math.max(leftMin, Math.min(leftMax, newPos));
    setGalleryPosition(clamped);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    // Mock submit
    setTimeout(() => {
      setComments((prev) => [...prev, {
        _id: Date.now().toString(),
        author: 'You',
        avatarInitial: 'Y',
        date: new Date().toISOString(),
        text: newComment,
      }]);
      setNewComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCommentDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Event not found</div>
      </div>
    );
  }

  const { leftMin, leftMax, numVisible } = galleryConfig;
  const showNavButtons = event.images && event.images.length > numVisible;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-[#05213C] hover:text-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </button>

        {/* Image Gallery - Updated to match PostDetails */}
        <div className={styles.container}>
          <div
            className={styles.feature}
            onMouseEnter={() => setShowGallery(true)}
            onMouseLeave={() => setShowGallery(false)}
          >
            <div
              className={styles.featuredItem}
              style={{
                backgroundImage: `url(${event.images?.[activeImageIndex] || '/placeholder-image.jpg'})`
              }}
            />

            {/* Gallery Controls */}
            <div className={`${styles.controls} ${showGallery ? styles.show : ''}`}>
              <button
                className={styles.moveBtn}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className={styles.moveBtn}
                onClick={handleNext}
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className={`${styles.galleryWrapper} ${showGallery ? styles.show : ''}`}>
            <div
              className={styles.gallery}
              style={{ left: `${galleryPosition}%` }}
            >
              {event.images?.map((image, index) => (
                <div key={index} className={styles.itemWrapper}>
                  <div
                    className={`${styles.galleryItem} ${index === activeImageIndex ? styles.active : ''}`}
                    style={{ backgroundImage: `url(${image})` }}
                    onClick={() => handleImageClick(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Comments (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.category === 'Workshop' ? 'bg-red-100 text-red-800' :
                  event.category === 'Volunteer' ? 'bg-blue-100 text-blue-800' :
                  event.category === 'Market' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.category}
                </span>
                {event.price > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    ${event.price}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-[#05213C] mb-4">{event.title}</h1>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#05213C] mb-4">About this Event</h2>
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event.description }} 
              />
            </div>

            {/* Comments Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#05213C] mb-4">Community Discussion ({comments.length})</h2>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="bg-[#05213C] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#05213C] text-white rounded-full flex items-center justify-center font-semibold">
                        {comment.avatarInitial}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">{formatCommentDate(comment.date)}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Details & Registration (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-[#05213C] mt-0.5">
                      <CalendarIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Date</h3>
                      <p className="text-gray-700">{formatDate(event.date)}</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-[#05213C] mt-0.5">
                      <ClockIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Time</h3>
                      <p className="text-gray-700">{formatTime(event.time)}</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-[#05213C] mt-0.5">
                      <LocationIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Location</h3>
                      <p className="text-gray-700">{event.location}</p>
                    </div>
                  </li>
                </ul>
                <button
                    onClick={() => navigate(`/events/register/${event._id}`)}
                    className="w-full bg-[#05213C] text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
                  >
                    Register for Event
                </button>
                <div className="mt-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Map Placeholder</span>
                  </div>
                </div>
              </div>

              {/* Similar Events Section */}
              {similarEvents && similarEvents.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-[#05213C] mb-4 text-center">Similar Events</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {similarEvents.slice(0, 3).map((similarEvent) => (
                      <div
                        key={similarEvent._id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/events/${similarEvent._id}`)}
                      >
                        <div className="flex">
                          <div className="w-20 h-20 flex-shrink-0">
                            {similarEvent.images && similarEvent.images.length > 0 ? (
                              <img
                                src={similarEvent.images[0]}
                                alt={similarEvent.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex-1">
                            <h3 className="font-semibold text-sm text-[#05213C] line-clamp-2">
                              {similarEvent.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(similarEvent.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}