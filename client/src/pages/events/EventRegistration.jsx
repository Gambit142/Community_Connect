import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, registerEvent } from '../../store/events/eventsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faClock,
  faLocationDot,
  faDollarSign,
  faUsers,
  faCircleInfo,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/EventRegistration.module.css';
export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEvent: event, loading, error } = useSelector((state) => state.events);
  const authState = useSelector((state) => state.login || {}); // Fixed: Use state.login with fallback to avoid undefined
  const { user } = authState;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    attendees: 1,
    specialRequests: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
    }
  }, [dispatch, id]);
  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (formData.attendees < 1) errors.attendees = 'At least 1 attendee required';
    if (!agreedToTerms) errors.terms = 'You must agree to the terms';
   
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const regData = {
        attendees: parseInt(formData.attendees),
        specialRequests: formData.specialRequests.trim(),
      };
      const result = await dispatch(registerEvent({ eventId: id, ...regData })).unwrap();
      if (result.sessionId) {
        // Paid: Store formData for later retrieval in confirmation
        localStorage.setItem(`reg_${result.sessionId}`, JSON.stringify(formData));
        // Redirect to Stripe
        window.location.href = result.url;
      } else {
        // Free: Navigate to confirmation
        navigate(`/events/payment-success/${id}`, {
          state: {
            registrationData: formData,
            event,
            totalPaid: 0,
            isFree: true
          }
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Handle error (e.g., set error state)
    } finally {
      setSubmitLoading(false);
    }
  };
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
  const calculateTotal = () => {
    return (event?.price || 0) * formData.attendees;
  };
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading event details...</p>
      </div>
    );
  }
  if (error || !event) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Event Not Found</h2>
          <p className={styles.errorText}>{error || 'This event does not exist.'}</p>
          <button onClick={() => navigate('/events')} className={styles.errorButton}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          Back
        </button>
        <div className={styles.pageTitle}>
          <h1 className={styles.title}>Event Registration</h1>
          <p className={styles.subtitle}>Complete your registration for this event</p>
        </div>
        <div className={styles.mainGrid}>
          {/* Left Column - Registration Form */}
          <div className={styles.formColumn}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Registration Details</h2>
             
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="fullName" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.fullName ? styles.inputError : ''}`}
                    placeholder="John Doe"
                  />
                  {formErrors.fullName && <p className={styles.errorMessage}>{formErrors.fullName}</p>}
                </div>
                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && <p className={styles.errorMessage}>{formErrors.email}</p>}
                </div>
                {/* Phone */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {formErrors.phone && <p className={styles.errorMessage}>{formErrors.phone}</p>}
                </div>
                {/* Number of Attendees */}
                <div className={styles.formGroup}>
                  <label htmlFor="attendees" className={styles.label}>
                    Number of Attendees <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    id="attendees"
                    name="attendees"
                    min="1"
                    max="10"
                    value={formData.attendees}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.attendees ? styles.inputError : ''}`}
                  />
                  {formErrors.attendees && <p className={styles.errorMessage}>{formErrors.attendees}</p>}
                </div>
                {/* Special Requests */}
                <div className={styles.formGroup}>
                  <label htmlFor="specialRequests" className={styles.label}>
                    Special Requests or Dietary Requirements
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows="4"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Any special accommodations needed..."
                  />
                </div>
                {/* Terms and Conditions */}
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label htmlFor="terms" className={styles.checkboxLabel}>
                    I agree to the terms and conditions and the event cancellation policy
                  </label>
                </div>
                {formErrors.terms && <p className={styles.errorMessage}>{formErrors.terms}</p>}
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitLoading || !agreedToTerms}
                  className={`${styles.submitButton} ${submitLoading ? styles.loadingButton : ''}`}
                >
                  {submitLoading
                    ? 'Processing...'
                    : event.price > 0
                      ? `Proceed to Payment - $${calculateTotal().toFixed(2)}`
                      : 'Complete Registration'
                  }
                </button>
              </form>
            </div>
          </div>
          {/* Right Column - Event Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Event Summary</h2>
             
              {/* Event Image */}
              {event.images && event.images.length > 0 && (
                <div className={styles.eventImage}>
                  <img src={event.images[0]} alt={event.title} />
                </div>
              )}
              {/* Event Title */}
              <h3 className={styles.eventTitle}>{event.title}</h3>
              {/* Event Details */}
              <div className={styles.eventDetails}>
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faCalendar} className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>Date</p>
                    <p className={styles.detailValue}>{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>Time</p>
                    <p className={styles.detailValue}>{formatTime(event.time)}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faLocationDot} className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>Location</p>
                    <p className={styles.detailValue}>{event.location}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faUsers} className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>Attendees</p>
                    <p className={styles.detailValue}>{formData.attendees}</p>
                  </div>
                </div>
              </div>
              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Price per ticket</span>
                  <span>${event.price > 0 ? event.price.toFixed(2) : '0.00'}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Number of tickets</span>
                  <span>×{formData.attendees}</span>
                </div>
                <div className={styles.priceDivider}></div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              {/* Info Box */}
              <div className={styles.infoBox}>
                <FontAwesomeIcon icon={faCircleInfo} className={styles.infoIcon} />
                <p className={styles.infoText}>
                  {event.price > 0
                    ? 'You will be redirected to checkout to complete your payment.'
                    : 'This is a free event. Click to complete your registration.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}