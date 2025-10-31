import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, getSimilarEvents, clearCurrentEvent } from '../../store/events/eventsSlice'; 
import styles from '../../assets/css/EventDetails.module.css';

// SVG Icons
const CalendarIcon = () => (
    <svg className={styles.detailIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const ClockIcon = () => (
    <svg className={styles.detailIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const LocationIcon = () => (
    <svg className={styles.detailIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Mock comments - keep as is
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
    const newPosition = Math.min(0, galleryPosition + (thumbWidth * 3));
    setGalleryPosition(Math.max(leftMin, newPosition));
  };

  const moveGalleryNext = () => {
    const { leftMin, leftMax } = galleryConfig;
    const newPosition = Math.max(leftMax, galleryPosition - (thumbWidth * 3));
    setGalleryPosition(Math.min(leftMax, newPosition));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    // Mock submit - in real, dispatch addComment thunk
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCommentDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInDays = Math.floor((now - commentDate) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return commentDate.toLocaleDateString();
  };

  if (loading) return <div className="text-center mt-8">Loading event...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  if (!event) return <div className="text-center mt-8">Event not found</div>;

  const formattedDate = formatDate(event.date);
  const formattedTime = formatTime(event.time);

  return (
    <div className={styles.eventDetailsContainer}>
      <main className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Left Column: Hero Image & Content */}
          <div className={styles.contentColumn}>
            <section className={styles.heroSection}>
              {/* Image Gallery - Mirroring PostDetails */}
              {event.images && event.images.length > 0 ? (
                <div className={styles.galleryContainer}>
                  <div
                    className={styles.mainImageContainer}
                    onClick={() => setShowGallery(true)}
                  >
                    <img
                      src={event.images[activeImageIndex]}
                      alt={event.title}
                      className={styles.mainImage}
                    />
                    {event.images.length > 1 && (
                      <div className={styles.galleryControls}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                          className={styles.prevButton}
                        >
                          <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNext(); }}
                          className={styles.nextButton}
                        >
                          <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className={styles.imageCounter}>
                          {activeImageIndex + 1} / {event.images.length}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className={styles.thumbnailGallery}>
                    <button
                      onClick={moveGalleryPrev}
                      className={`${styles.thumbNav} ${galleryPosition >= 0 ? styles.disabled : ''}`}
                    >
                      <svg className={styles.thumbNavIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div
                      className={styles.thumbnailsContainer}
                      style={{ left: `${galleryPosition}%` }}
                    >
                      {event.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${event.title} ${index + 1}`}
                          className={`${styles.thumbnail} ${index === activeImageIndex ? styles.active : ''}`}
                          onClick={() => handleImageClick(index)}
                        />
                      ))}
                    </div>
                    <button
                      onClick={moveGalleryNext}
                      className={`${styles.thumbNav} ${galleryPosition <= galleryConfig.leftMax ? styles.disabled : ''}`}
                    >
                      <svg className={styles.thumbNavIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.placeholderImage}>
                  <span>No images available</span>
                </div>
              )}

              {/* Full Gallery Modal */}
              {showGallery && (
                <div className={styles.galleryModal} onClick={() => setShowGallery(false)}>
                  <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <button
                      className={styles.closeModal}
                      onClick={() => setShowGallery(false)}
                    >
                      ×
                    </button>
                    <div className={styles.modalImageContainer}>
                      <img
                        src={event.images[activeImageIndex]}
                        alt={event.title}
                        className={styles.modalImage}
                      />
                      <button
                        onClick={handlePrev}
                        className={styles.modalPrev}
                      >
                        <svg className={styles.modalNavIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNext}
                        className={styles.modalNext}
                      >
                        <svg className={styles.modalNavIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.modalThumbnails}>
                      {event.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${event.title} ${index + 1}`}
                          className={`${styles.modalThumbnail} ${index === activeImageIndex ? styles.active : ''}`}
                          onClick={() => handleImageClick(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <h1 className={styles.eventTitle}>{event.title}</h1>
              <div className={styles.categoryBadge}>{event.category}</div>
              <div
                className={styles.eventDescription}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </section>

            {/* Comments Section - Keep as is */}
            <section className={styles.commentsSection}>
              <h2 className={styles.sectionTitle}>Comments ({comments.length})</h2>
              <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <textarea
                  className={styles.commentTextarea}
                  rows="4"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                />
                <button type="submit" className={styles.commentSubmitButton} disabled={isSubmitting || !newComment.trim()}>
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comment List */}
              <div className={styles.commentList}>
                {comments.map((comment) => (
                  <div key={comment._id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>{comment.avatarInitial}</div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.author}</span>
                        <span className={styles.commentDate}>{formatCommentDate(comment.date)}</span>
                      </div>
                      <p className={styles.commentBody}>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Details & Registration */}
          <aside className={styles.sidebarColumn}>
            <div className={styles.stickySidebar}>
              <div className={styles.detailsCard}>
                <ul className={styles.detailsList}>
                  <li className={styles.detailItem}>
                    <CalendarIcon />
                    <div>
                      <h3 className={styles.detailTitle}>Date</h3>
                      <p className={styles.detailText}>{formattedDate}</p>
                    </div>
                  </li>
                  <li className={styles.detailItem}>
                    <ClockIcon />
                    <div>
                      <h3 className={styles.detailTitle}>Time</h3>
                      <p className={styles.detailText}>{formattedTime}</p>
                    </div>
                  </li>
                  <li className={styles.detailItem}>
                    <LocationIcon />
                    <div>
                      <h3 className={styles.detailTitle}>Location</h3>
                      <p className={styles.detailText}>{event.location}</p>
                    </div>
                  </li>
                </ul>
                <button className={styles.registerButton}>Register for Event</button>
                <div className={styles.mapContainer}>
                  {/* Placeholder for a future map integration */}
                  <span>Map Placeholder</span>
                </div>
              </div>

              {/* Similar Events Section - Mirroring Similar Posts */}
              {similarEvents && similarEvents.length > 0 && (
                <div className={styles.similarEventsSection}>
                  <h2 className={styles.sectionTitle}>Similar Events</h2>
                  <div className={styles.similarEventsGrid}>
                    {similarEvents.slice(0, 4).map((similarEvent) => (
                      <div
                        key={similarEvent._id}
                        className={styles.similarEventCard}
                        onClick={() => navigate(`/events/${similarEvent._id}`)}
                      >
                        {/* Fixed height image container */}
                        <div className="h-48 w-full overflow-hidden">
                          {similarEvent.images && similarEvent.images.length > 0 ? (
                            <img
                              src={similarEvent.images[0]}
                              alt={similarEvent.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-grow p-4">
                          {/* Fixed height badges section */}
                          <div className="flex flex-wrap gap-1 mb-3 min-h-[2rem] items-start">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              similarEvent.category === 'Workshop' ? 'bg-red-100 text-red-800' :
                              similarEvent.category === 'Volunteer' ? 'bg-blue-100 text-blue-800' :
                              similarEvent.category === 'Market' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {similarEvent.category}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {similarEvent.price > 0 ? `$${similarEvent.price}` : 'Free'}
                            </span>
                          </div>

                          {/* Fixed height title */}
                          <div className="min-h-[3rem] mb-3 flex items-start">
                            <h3 className={`${styles.similarEventTitle} line-clamp-2 w-full`}>
                              {similarEvent.title}
                            </h3>
                          </div>

                          {/* Flexible description */}
                          <p className={`${styles.similarEventDescription} flex-grow`}>
                            {similarEvent.description.substring(0, 100)}...
                          </p>

                          {/* Fixed height metadata at bottom */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 min-h-[1.5rem]">
                            <span>{new Date(similarEvent.date).toLocaleDateString()}</span>
                            <span>Event</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}