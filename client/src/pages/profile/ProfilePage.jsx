import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../store/profile/profileThunks.js';
import { getMyPosts } from '../../store/posts/postsSlice.js';
import { getRegisteredEvents } from '../../store/events/eventsSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faMapMarkerAlt, faCalendar, faEdit, faUserTag } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/ProfilePage.module.css';

// SVG Icons
const PostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const EventIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Profile data
  const { user: profileUser, loading: profileLoading, error } = useSelector((state) => state.profile);
  const loginUser = useSelector((state) => state.login.user);
  const currentUser = profileUser || loginUser;

  const { posts = [], loading: postsLoading } = useSelector((state) => state.posts);
  const { registeredEvents = [], loading: eventsLoading } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyPosts({ limit: 5 }));
    dispatch(getRegisteredEvents({ limit: 5 })); 
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = profileLoading || postsLoading || eventsLoading;

  if (isLoading && !currentUser) {
    return <div className="text-center py-20 text-white">Loading your profile...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Enhanced Header Section */}
      <header className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt={currentUser.username} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className={styles.avatarOverlay}>
              <FontAwesomeIcon icon={faUser} className={styles.avatarIcon} />
            </div>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userHeader}>
              <h1 className={styles.username}>{currentUser?.username || 'Guest User'}</h1>
              <span className={styles.userBadge}>
                <FontAwesomeIcon icon={faUserTag} className={styles.badgeIcon} />
                {currentUser?.userType || 'Member'}
              </span>
            </div>
            
            <p className={styles.bio}>{currentUser?.bio || 'No bio yet. Tell your community about yourself!'}</p>
            
            <div className={styles.userDetails}>
              {currentUser?.email && (
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.detailIcon} />
                  <span>{currentUser.email}</span>
                </div>
              )}
              
              {currentUser?.location && (
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.detailIcon} />
                  <span>{currentUser.location}</span>
                </div>
              )}
              
              {currentUser?.createdAt && (
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faCalendar} className={styles.detailIcon} />
                  <span>Joined {formatDate(currentUser.createdAt)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button 
              onClick={() => navigate('/profile/edit')} 
              className={styles.editButton}
            >
              <FontAwesomeIcon icon={faEdit} className={styles.editIcon} />
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.activitySection}>
          <div className={styles.activityGrid}>
            {/* My Posts */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">My Posts</h3>
              {postsLoading ? (
                <p className="text-gray-500">Loading posts...</p>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.slice(0, 5).map(post => (
                    <Link
                      to={`/posts/${post._id}`}
                      key={post._id}
                      className={styles.activityCard}
                    >
                      <div className={`${styles.activityIconContainer} bg-green-500`}>
                        <PostIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={styles.activityCardTitle}>{post.title}</p>
                        <p className={styles.activityCardDate}>Posted on {formatDate(post.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                  {posts.length > 5 && (
                    <Link to="/posts/my-posts" className="text-blue-600 text-sm font-medium hover:underline">
                      View all posts →
                    </Link>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>You haven't created any posts yet. <Link to="/posts/create" className={styles.link}>Share a resource</Link>.</p>
                </div>
              )}
            </div>

            {/* My Upcoming Events */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">My Upcoming Events</h3>
              {eventsLoading ? (
                <p className="text-gray-500">Loading events...</p>
              ) : registeredEvents.length > 0 ? (
                <div className="space-y-4">
                  {registeredEvents.slice(0, 5).map(event => (
                    <Link
                      to={`/events/${event._id}`}
                      key={event._id}
                      className={styles.activityCard}
                    >
                      <div className={`${styles.activityIconContainer} bg-yellow-500`}>
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={styles.activityCardTitle}>{event.title}</p>
                        <p className={styles.activityCardDate}>Event on {formatDate(event.date)}</p>
                      </div>
                    </Link>
                  ))}
                  {registeredEvents.length > 5 && (
                    <Link to="/events/my-events?tab=registered" className="text-blue-600 text-sm font-medium hover:underline">
                      View all registered events →
                    </Link>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>You aren't registered for any upcoming events. <Link to="/events" className={styles.link}>Find an event</Link>.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}