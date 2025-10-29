// src/pages/About.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/css/About.module.css';

// SVG Icons for Values Section
const CollaborationIcon = () => (
    <svg className={styles.valueIcon} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-5M3 8V4h5M3 20v-4h5m13-2V4h-5m-4 5a3 3 0 01-6 0 3 3 0 016 0zm6 11a3 3 0 100-6 3 3 0 000 6zM3 4a3 3 0 100 6 3 3 0 000-6zm18 0a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
);
const AccountabilityIcon = () => (
    <svg className={styles.valueIcon} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917L12 22l9-1.083A12.02 12.02 0 0021 9.984a11.955 11.955 0 01-5.382-3.001z" />
    </svg>
);
const InclusivityIcon = () => (
    <svg className={styles.valueIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-4 0A6 6 0 003 20v1z" />
    </svg>
);

export default function About() {
  return (
    <div>
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.headerOverlay}></div> {/* This is the dark overlay */}
        <div className={styles.headerContent}> {/* This holds the text */}
          <h1 className={styles.headerTitle}>We're Building Bridges in Our Community</h1>
          <p className={styles.headerSubtitle}>
            Learn about our mission to create a more connected, supportive, and resilient neighborhood for everyone.
          </p>
        </div>
      </section>

      {/* Our Mission and Story */}
      <section className={`${styles.contentSection} bg-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={styles.missionGrid}>
            <div>
              <h2 className={styles.sectionHeading}>Our Story</h2>
              <p className={styles.sectionText}>
                Community Connect was born from a simple idea: modern communities face fragmented support systems. Resources, services, and events are scattered across multiple platforms, making it difficult for people to connect and collaborate effectively. We saw a need for a centralized, user-friendly platform to foster collaboration, accountability, and inclusivity by providing a single hub for all community support activities.
              </p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop" 
              alt="Community collaboration" 
              className={styles.missionImage}
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className={`${styles.contentSection} ${styles.valuesSection}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={styles.sectionHeading}>Our Core Values</h2>
            <p className="text-lg text-gray-600">These principles guide everything we do.</p>
            <div className={styles.valuesGrid}>
                <div className={styles.valueCard}>
                    <CollaborationIcon />
                    <h3 className={styles.valueTitle}>Collaboration</h3>
                    <p className={styles.valueDescription}>We believe in the power of working together to achieve common goals and support one another.</p>
                </div>
                <div className={styles.valueCard}>
                    <AccountabilityIcon />
                    <h3 className={styles.valueTitle}>Trust & Accountability</h3>
                    <p className={styles.valueDescription}>Our rating and review system ensures transparency, building a community founded on trust.</p>
                </div>
                <div className={styles.valueCard}>
                    <InclusivityIcon />
                    <h3 className={styles.valueTitle}>Inclusivity</h3>
                    <p className={styles.valueDescription}>We are committed to creating a welcoming space for every member of our diverse community.</p>
                </div>
            </div>
        </div>
      </section>

      {/* How We Help */}
      <section className={`${styles.contentSection} ${styles.howWeHelpSection}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={styles.sectionHeading}>How Our Platform Helps</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${styles.helpCard} group`}>
              <img src="https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=2070&auto=format&fit=crop" alt="Resource sharing" className={styles.helpImage} />
              <div className={styles.helpOverlay}></div>
              <div className={styles.helpContent}>
                <h3 className={styles.helpTitle}>Share & Discover Resources</h3>
                <p className={styles.helpDescription}>From food donations to job opportunities, our resource board connects those in need with those who can help.</p>
                <Link to="/posts" className={styles.helpLink}>View Listings &rarr;</Link>
              </div>
            </div>
            <div className={`${styles.helpCard} group`}>
              <img src="https://images.unsplash.com/photo-1553073520-80b5ad5ec870" alt="Community event" className={styles.helpImage} />
              <div className={styles.helpOverlay}></div>
              <div className={styles.helpContent}>
                <h3 className={styles.helpTitle}>Organize & Attend Events</h3>
                <p className={styles.helpDescription}>Find workshops, local markets, and volunteer meetups, or create your own event to bring people together.</p>
                <Link to="/events" className={styles.helpLink}>Browse Events &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className={`${styles.contentSection} ${styles.joinUsSection}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={styles.sectionHeading}>Become a Part of Our Community</h2>
            <p className="mt-2 text-lg text-gray-600">Join us in making our neighborhood a better place for everyone. Signing up is free and easy.</p>

            {/* Wrap the button in a div with a top margin */}
            <div className="mt-8">
                <Link to="/auth/signup" className={styles.joinUsButton}>
                    Create Your Account
                </Link>
            </div>
          </div>
      </section>
    </div>
  );
}