// src/pages/profile/ProfilePage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../../assets/css/ProfilePage.module.css';

// MOCK DATA
const userPosts = [
  { _id: 'p1', title: 'Donating Winter Coats', createdAt: '2025-10-15T10:00:00Z' },
  { _id: 'p2', title: 'Offering Free Tutoring for Math', createdAt: '2025-10-10T12:30:00Z' },
];

const userEvents = [
  { _id: 'e3', title: 'Community Garden Workshop', date: '2025-11-05T14:00:00Z' },
  { _id: 'e4', title: 'Local Farmers Market', date: '2025-11-15T11:00:00Z' },
];

// SVG Icons for stats and activity
const PostIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> );
const EventIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> );

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.login.user) || { username: 'Guest', email: 'guest@example.com' };

  const userProfile = {
      ...user,
      bio: "Passionate about building stronger communities through technology and mutual aid. Actively involved in local gardening and tutoring initiatives.",
      postsCreated: 12,
      eventsAttended: 5,
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.pageContainer}>
      {/* Profile Header */}
      <header className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            {userProfile.username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.username}>{userProfile.username}</h1>
            <p className={styles.userBio}>{userProfile.bio}</p>
            <button onClick={() => navigate('/profile/edit')} className={styles.editProfileButton}>
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Stats Section */}
        <section>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><PostIcon/></div>
              <div>
                <p className={styles.statValue}>{userProfile.postsCreated}</p>
                <p className={styles.statLabel}>Posts Created</p>
              </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><EventIcon/></div>
              <div>
                <p className={styles.statValue}>{userProfile.eventsAttended}</p>
                <p className={styles.statLabel}>Events Attended</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- REBUILT Recent Activity Section --- */}
        <section>
          <h2 className={styles.activityTitle}>Recent Activity</h2>
          <div className={styles.activityGrid}>
            {/* Recent Posts */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">My Latest Posts</h3>
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
                <div className={styles.emptyState}><p>You haven't created any posts yet. <Link to="/posts/create" className={styles.link}>Share a resource</Link>.</p></div>
              )}
            </div>
            
            {/* Upcoming Events */}
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
                <div className={styles.emptyState}><p>You aren't registered for any upcoming events. <Link to="/events" className={styles.link}>Find an event</Link>.</p></div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}