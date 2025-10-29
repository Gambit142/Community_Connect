// src/pages/Landing.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/css/Landing.module.css';

// SVG Icons for features
const ShareIcon = () => (
    <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const CalendarIcon = () => (
    <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TrustIcon = () => (
    <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          
          <h1 className={styles.heroTitle}>
            Build a Stronger, More Connected Community
          </h1>
          <p className={styles.heroSubtitle}>
            Community Connect is the central hub for sharing resources, discovering local events, and fostering trust among neighbors.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/posts" className="btn-black">Explore Resources</Link>
            <Link to="/auth/signup" className={styles.buttonSecondaryHero}>Join Now</Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={styles.sectionTitle}>Everything Your Community Needs</h2>
          <p className={styles.sectionSubtitle}>All in one unified platform.</p>
          <div className={styles.featuresGrid}>
            
            <div className={styles.featureCard}>
              <ShareIcon />
              <h3 className={styles.featureTitle}>Resource Board</h3>
              <p className={styles.featureDescription}>Easily share and find local resources like food donations, tutoring, ridesharing, and more. A centralized place for mutual aid.</p>
            </div>

            <div className={styles.featureCard}>
              <CalendarIcon />
              <h3 className={styles.featureTitle}>Event Calendar</h3>
              <p className={styles.featureDescription}>Stay updated with community workshops, gatherings, and volunteer opportunities. Register for events and see who's attending.</p>
            </div>

            <div className={styles.featureCard}>
              <TrustIcon />
              <h3 className={styles.featureTitle}>Rating & Review System</h3>
              <p className={styles.featureDescription}>Build accountability and trust with a transparent feedback system for services and resources shared within the community.</p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={styles.sectionTitle}>Get Started in 3 Easy Steps</h2>
            <div className={styles.stepsContainer}>
                <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <h3 className={styles.stepTitle}>Create an Account</h3>
                    <p className={styles.stepDescription}>Join the community to start sharing and connecting.</p>
                </div>
                <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <h3 className={styles.stepTitle}>Share or Find</h3>
                    <p className={styles.stepDescription}>Post a resource, create an event, or browse what's available.</p>
                </div>
                <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <h3 className={styles.stepTitle}>Connect & Grow</h3>
                    <p className={styles.stepDescription}>Engage with your neighbors and help your community thrive.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Ready to make a difference in your community?
          </h2>
          <Link to="/auth/signup" className={styles.ctaButton}>
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
}