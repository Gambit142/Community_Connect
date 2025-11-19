// src/pages/profile/ProfilePage.jsx

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../store/profile/profileThunks.js';
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.profile);
  const loginUser = useSelector((state) => state.login.user);

  const currentUser = user || loginUser;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Replace with real data later when you have posts/events slices
  const userPosts = currentUser?.posts || [];
  const userEvents = currentUser?.attendedEvents || [];

  if (loading && !currentUser) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            {currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt={currentUser.username} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {currentUser?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.username}>{currentUser?.username || 'Guest User'}</h1>
            <p className={styles.bio}>{currentUser?.bio || 'No bio yet. Tell your community about yourself!'}</p>
            {currentUser?.location && <p className={styles.location}>📍 {currentUser.location}</p>}
            <button onClick={() => navigate('/profile/edit')} className={styles.editButton}>
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.activitySection}>
          <div className={styles.activityGrid}>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">My Posts</h3>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <Link to={`/posts/${post._id}`} key={post._id} className={styles.activityCard}>
                      <div className={`${styles.activityIconContainer} bg-green-500`}>
                        <PostIcon className="h-5 w-5"/>
                      </div>
                      <div>
                        <p className={styles.activityCardTitle}>{post.title}</p>
                        <p className={styles.activityCardDate}>Posted on {formatDate(post.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>You haven't created any posts yet. <Link to="/posts/create" className={styles.link}>Share a resource</Link>.</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">My Upcoming Events</h3>
              {userEvents.length > 0 ? (
                <div className="space-y-4">
                  {userEvents.map(event => (
                    <Link to={`/events/${event._id}`} key={event._id} className={styles.activityCard}>
                      <div className={`${styles.activityIconContainer} bg-yellow-500`}>
                        <EventIcon className="h-5 w-5"/>
                      </div>
                      <div>
                        <p className={styles.activityCardTitle}>{event.title}</p>
                        <p className={styles.activityCardDate}>Event on {formatDate(event.date)}</p>
                      </div>
                    </Link>
                  ))}
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