// pages/events/PaymentConfirmation.jsx (Fixed: Use unwrap() for event data, handle payload structure)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById } from '../../store/events/eventsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCalendar,
  faLocationDot,
  faEnvelope,
  faPhone,
  faDownload,
  faArrowRight,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/PaymentConfirmation.module.css';
export default function PaymentConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
 
  const sessionId = searchParams.get('session_id');
 
  const { currentEvent: eventFromStore } = useSelector((state) => state.events);
  const [regData, setRegData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const { registrationData, event: eventFromState, totalPaid: totalFromState, isFree: isFreeFromState } = location.state || {};
  useEffect(() => {
    const initializeData = async () => {
      if (registrationData && eventFromState) {
        // From free registration navigate
        setRegData(registrationData);
        setEventData(eventFromState);
        setTotalPaid(totalFromState || 0);
        setIsFree(isFreeFromState || false);
        setLoading(false);
      } else if (sessionId) {
        // From Stripe redirect (paid)
        const stored = localStorage.getItem(`reg_${sessionId}`);
        if (stored) {
          const parsedRegData = JSON.parse(stored);
          setRegData(parsedRegData);
          localStorage.removeItem(`reg_${sessionId}`);
          // Fetch event with unwrap()
          try {
            const result = await dispatch(getEventById(id)).unwrap(); // Fixed: Use unwrap() to get direct payload
            setEventData(result.event); // Fixed: Access .event from { message, event }
            setTotalPaid(result.event.price * parsedRegData.attendees);
            setIsFree(false);
          } catch (err) {
            console.error('Failed to fetch event:', err);
          }
          setLoading(false);
        } else {
          // Fallback: redirect back
          navigate(`/events/${id}`);
        }
      } else {
        // No data
        navigate('/events');
      }
    };
    initializeData();
  }, [dispatch, id, sessionId, registrationData, eventFromState, totalFromState, isFreeFromState, navigate]);
  useEffect(() => {
    // Redirect if no data after init
    if (!loading && !regData) {
      navigate('/events');
    }
  }, [loading, regData, navigate]);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
  const generateConfirmationNumber = () => {
    return `CC-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };
  const confirmationNumber = generateConfirmationNumber();
  const handleDownloadTicket = () => {
    // TODO: Implement PDF ticket download
    console.log('Downloading ticket...');
    alert('Ticket download feature coming soon!');
  };
  const handleAddToCalendar = () => {
    // TODO: Implement calendar integration
    console.log('Adding to calendar...');
    alert('Calendar integration coming soon!');
  };
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Preparing your confirmation...</p>
      </div>
    );
  }
  if (!regData || !eventData) {
    return null;
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Success Header */}
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>
            <FontAwesomeIcon icon={faCircleCheck} className={styles.checkIcon} />
          </div>
          <h1 className={styles.successTitle}>
            {isFree ? 'Registration Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className={styles.successSubtitle}>
            Your event registration has been confirmed. A confirmation email has been sent to {regData.email}
          </p>
        </div>
        {/* Confirmation Details */}
        <div className={styles.mainGrid}>
          {/* Left Column - Event Details */}
          <div className={styles.detailsColumn}>
            <div className={styles.detailsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Event Details</h2>
                <span className={styles.confirmationBadge}>
                  Confirmation #{confirmationNumber}
                </span>
              </div>
              {/* Event Image */}
              {eventData.images && eventData.images.length > 0 && (
                <div className={styles.eventImage}>
                  <img src={eventData.images[0]} alt={eventData.title} />
                </div>
              )}
              {/* Event Info */}
              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{eventData.title}</h3>
               
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <FontAwesomeIcon icon={faCalendar} className={styles.infoIcon} />
                    <div>
                      <p className={styles.infoLabel}>Date & Time</p>
                      <p className={styles.infoValue}>
                        {formatDate(eventData.date)} at {formatTime(eventData.time)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <FontAwesomeIcon icon={faLocationDot} className={styles.infoIcon} />
                    <div>
                      <p className={styles.infoLabel}>Location</p>
                      <p className={styles.infoValue}>{eventData.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button onClick={handleDownloadTicket} className={styles.primaryButton}>
                  <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                  Download Ticket
                </button>
                <button onClick={handleAddToCalendar} className={styles.secondaryButton}>
                  <FontAwesomeIcon icon={faCalendar} className="w-5 h-5" />
                  Add to Calendar
                </button>
              </div>
            </div>
            {/* What's Next Section */}
            <div className={styles.whatsNextCard}>
              <h3 className={styles.whatsNextTitle}>What's Next?</h3>
              <div className={styles.stepsList}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Check Your Email</h4>
                    <p className={styles.stepDescription}>
                      We've sent a confirmation email with your ticket and event details to {regData.email}
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Save Your Ticket</h4>
                    <p className={styles.stepDescription}>
                      Download and save your ticket. You'll need to present it at the event entrance.
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Arrive on Time</h4>
                    <p className={styles.stepDescription}>
                      Plan to arrive 15-30 minutes early to check in and get settled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Summary & Contact */}
          <div className={styles.summaryColumn}>
            {/* Registration Summary */}
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Registration Summary</h3>
             
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Attendee Name</span>
                  <span className={styles.summaryValue}>{regData.fullName}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Email</span>
                  <span className={styles.summaryValue}>{regData.email}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Phone</span>
                  <span className={styles.summaryValue}>{regData.phone}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Number of Tickets</span>
                  <span className={styles.summaryValue}>{regData.attendees}</span>
                </div>
                {regData.specialRequests && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Special Requests</span>
                    <span className={styles.summaryValue}>{regData.specialRequests}</span>
                  </div>
                )}
              </div>
              {!isFree && totalPaid && (
                <>
                  <div className={styles.priceDivider}></div>
                  <div className={styles.totalPaid}>
                    <span className={styles.totalLabel}>Total Paid</span>
                    <span className={styles.totalAmount}>${totalPaid.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            {/* Contact Card */}
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>Need Help?</h3>
              <p className={styles.contactDescription}>
                If you have any questions or need to make changes to your registration, please contact us.
              </p>
              <div className={styles.contactMethods}>
                <a href={`mailto:support@communityconnect.com`} className={styles.contactMethod}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
                  <span>support@communityconnect.com</span>
                </a>
                <a href="tel:+15551234567" className={styles.contactMethod}>
                  <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
                  <span>(555) 123-4567</span>
                </a>
              </div>
            </div>
            {/* Navigation Links */}
            <div className={styles.navLinks}>
              <button onClick={() => navigate('/events/my-events')} className={styles.navLink}>
                View My Events
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/events')} className={styles.navLink}>
                Browse More Events
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}