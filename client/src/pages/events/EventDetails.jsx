import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, getSimilarEvents, clearCurrentEvent, likeEvent } from '../../store/events/eventsSlice';
import CommentSection from '../../components/comments/CommentSection.jsx';
import SimilarItems from '../../components/SimilarItems.jsx';
import styles from '../../assets/css/EventDetails.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

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
  const { user } = useSelector((state) => state.login);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryPosition, setGalleryPosition] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(23);

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

  const handleLike = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    try {
      await dispatch(likeEvent(id)).unwrap();
    } catch (error) {
      console.error('Failed to like event:', error);
    }
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

        {/* Image Gallery */}
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

              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-[#05213C] mb-4 flex-1">{event.title}</h1>
                
                {/* Like Button */}
                {user && (
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ml-4 ${
                      event.isLiked 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:text-red-600'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={event.isLiked ? faHeartSolid : faHeartRegular} 
                      className={`w-5 h-5 ${event.isLiked ? 'text-red-600' : ''}`}
                    />
                    <span className="font-medium">{event.likeCount || 0}</span>
                  </button>
                )}
              </div>
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
            <CommentSection 
              resourceType="event" 
              resourceId={id} 
              resourceTitle={event.title}
            />
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
                  <SimilarItems 
                    items={similarEvents} 
                    type="event" 
                    title="Similar Events" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}