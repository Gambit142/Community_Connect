// src/pages/Landing.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/css/Landing.module.css';

// Import slider components and styles
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- SVG ICONS ---
const ShareIcon = () => ( <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> );
const CalendarIcon = () => ( <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> );
const TrustIcon = () => ( <svg className={styles.featureIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const LocationIcon = () => ( <svg className={styles.cardLocationIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );

// --- MOCK DATA FOR EVENTS SLIDER ---
const mockEvents = [
  { _id: '1', title: 'Community Garden Workshop', category: 'Workshop', location: 'Central Park', date: '2025-11-05T14:00:00Z', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop' },
  { _id: '2', title: 'Neighborhood Cleanup Day', category: 'Volunteer', location: 'City Hall', date: '2025-11-12T09:00:00Z', image: 'https://images.unsplash.com/photo-1618479122201-cf6d52a236d7?q=80&w=2070&auto=format&fit=crop' },
  { _id: '3', title: 'Local Farmers Market', category: 'Market', location: 'Downtown Square', date: '2025-11-15T11:00:00Z', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=2070&auto=format&fit=crop' },
  { _id: '4', title: 'Annual Charity Run 5K', category: 'Charity', location: 'Lakeside Path', date: '2025-11-22T08:00:00Z', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop' },
];

// --- FAQ DATA & COMPONENT ---
const faqData = [
  { question: "What is Community Connect?", answer: "Community Connect is a centralized platform designed to help community members share resources, discover local events, and build trust. It's a one-stop-shop for mutual aid, event coordination, and community building." },
  { question: "How can I share a resource or create an event?", answer: "Once you create a free account, you can use the 'Create Post' or 'Create Event' buttons. Fill in the details, submit for a quick review by our admins, and it will be visible to the community." },
  { question: "Is there a cost to use the platform?", answer: "No, Community Connect is completely free for all members. Our goal is to make community support accessible to everyone." },
];

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className={styles.faqItem}>
    <div className={styles.faqQuestion} onClick={onClick}>
      <span>{faq.question}</span>
      <svg className={`${styles.faqIcon} ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
    </div>
    <div className={styles.faqAnswer} style={{ maxHeight: isOpen ? '200px' : '0px' }}>
      <p>{faq.answer}</p>
    </div>
  </div>
);

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };
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

      {/* --- NEW: Infographic CTA Section --- */}
      <section className={styles.infographicSection}>
        <div className={styles.infographicGrid}>
          <div className={styles.infographicContent}>
            <h2 className={styles.infographicTitle}>Give and Get Help, Seamlessly</h2>
            <p className={styles.infographicText}>Our posts wall is the heart of our community. From surplus groceries to skilled services, every post makes a difference. See what your neighbors are sharing today.</p>
            <Link to="/posts" className={styles.infographicButton}>Browse Posts</Link>
          </div>
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" alt="People helping each other" className={styles.infographicImage} />
        </div>
      </section>

      {/* --- NEW: Recent Events Section --- */}
      <section className={styles.eventsSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <p className={styles.sectionSubtitle}>Get involved and meet your neighbors.</p>
          <div className="mt-8">
            <Slider {...sliderSettings}>
              {mockEvents.map((event) => {
                const { month, day } = formatDate(event.date);
                return (
                  <div key={event._id}>
                    <div className={styles.eventCard}>
                      <div className={styles.cardImageContainer}>
                        <img src={event.image} alt={event.title} className={styles.cardImage} />
                        <div className={styles.cardDateBadge}><span className={styles.dateMonth}>{month}</span><span className={styles.dateDay}>{day}</span></div>
                      </div>
                      <div className={styles.cardContent}>
                        <p className={styles.cardCategory}>{event.category}</p>
                        <h3 className={styles.cardTitle}>{event.title}</h3>
                        <div className={styles.cardLocation}><LocationIcon /><span>{event.location}</span></div>
                        <Link to={`/events/${event._id}`} className={styles.cardButton}>View Details</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>
      </section>

      {/* --- NEW: FAQ Section --- */}
      <section className={styles.faqSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={`${styles.faqContainer} mt-8`}>
            {faqData.map((faq, index) => (
              <FAQItem key={index} faq={faq} isOpen={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} />
            ))}
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