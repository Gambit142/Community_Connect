// src/pages/events/EventDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../assets/css/EventDetails.module.css';

// MOCK DATA - In a real app, you would fetch this by ID
const mockEvent = { 
  _id: '1', 
  title: 'Community Garden Workshop', 
  category: 'Workshop', 
  location: 'Central Park Community Garden, Brampton', 
  date: '2025-11-05T14:00:00Z', 
  image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop',
  description: `
    <p>Join us for an interactive and hands-on workshop dedicated to the art of urban gardening. Whether you're a seasoned green thumb or a complete beginner, you'll learn valuable skills to help our community garden flourish.</p>
    <h2>What You'll Learn:</h2>
    <ul>
      <li>Soil preparation and composting techniques.</li>
      <li>Seasonal planting for our local climate.</li>
      <li>Natural pest control methods.</li>
      <li>Tips for harvesting and preserving your produce.</li>
    </ul>
    <p>All tools and materials will be provided. Please wear comfortable clothing that you don't mind getting a little dirty. This is a great opportunity to meet fellow community members and contribute to a beautiful, sustainable local space.</p>
  `
};

// NEW: Mock data for comments
const mockComments = [
  { _id: 'c1', author: 'Jane Doe', avatarInitial: 'J', date: '2025-10-23T10:00:00Z', text: 'This looks amazing! I\'ve been wanting to learn more about composting. Will there be a Q&A session?' },
  { _id: 'c2', author: 'John Smith', avatarInitial: 'J', date: '2025-10-24T11:30:00Z', text: 'Count me in! Happy to bring some extra gloves for anyone who needs them.' },
];

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
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: State for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  useEffect(() => {
    // Simulate fetching data for the specific event ID
    setLoading(true);
    setTimeout(() => {
      setEvent(mockEvent); // Using mock data for now
      setLoading(false);
    }, 500);

  }, [id]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvent(mockEvent);
      setComments(mockComments); // Load mock comments
      setLoading(false);

    }, 500);
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const submittedComment = {
        _id: `c${Date.now()}`,
        author: 'You', // In a real app, this would be the logged-in user
        avatarInitial: 'Y',
        date: new Date().toISOString(),
        text: newComment,
      };
      setComments(prev => [submittedComment, ...prev]);
      setNewComment('');
      setIsSubmitting(false);
    }, 1000);
  };
  
  const formatCommentDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading event details...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found.</div>;
  
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  
  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroContainer}>
        <img src={event.image} alt={event.title} className={styles.heroImage} />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className={styles.heroCategory}>{event.category}</p>
          <h1 className={styles.heroTitle}>{event.title}</h1>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContainer}>
        <div className={styles.mainGrid}>
          {/* Left Column: Description */}
          <div className={styles.contentColumn}>
            <h2 className={styles.descriptionTitle}>About this Event</h2>
            <div 
              className={styles.descriptionBody} 
              dangerouslySetInnerHTML={{ __html: event.description }} 
            />

            {/* --- NEW: Comments Section --- */}
            <section className={styles.commentsSection}>
              <h2 className={styles.commentsTitle}>Community Discussion ({comments.length})</h2>
              
              {/* Comment Form */}
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
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}