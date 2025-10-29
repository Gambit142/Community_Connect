// src/pages/Contact.jsx

import React, { useState } from 'react';
import styles from '../assets/css/Contact.module.css';

// SVG Icons
const MailIcon = () => (
    <svg className={styles.contactIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const LocationIcon = () => (
    <svg className={styles.contactIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // null, 'sending', 'success', 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    // Simulate API call
    setTimeout(() => {
      // For now, we'll just simulate a success message
      console.log('Form submitted:', formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Reset status after a few seconds
      setTimeout(() => setFormStatus(null), 5000);
    }, 1500);
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.gridContainer}>
        {/* Contact Information */}
        <div className={styles.infoContainer}>
          <h1 className={styles.sectionTitle}>Get in touch</h1>
          <p className={styles.sectionSubtitle}>
            Have a question or feedback? We’d love to hear from you. Fill out the form, and we'll get back to you as soon as possible.
          </p>
          <dl className={styles.contactList}>
            <div className={styles.contactItem}>
              <dt><LocationIcon /></dt>
              <dd className={styles.contactText}>Brampton, ON, Canada</dd>
            </div>
            <div className={styles.contactItem}>
              <dt><MailIcon /></dt>
              <dd className={styles.contactText}>
                <a href="mailto:info@communityconnect.com" className="hover:text-black">info@communityconnect.com</a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Contact Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label htmlFor="name" className={styles.formLabel}>Full Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className={styles.formInput} />
            </div>
            <div>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className={styles.formInput} />
            </div>
            <div>
              <label htmlFor="message" className={styles.formLabel}>Message</label>
              <textarea name="message" id="message" rows="4" required value={formData.message} onChange={handleChange} className={styles.formTextarea}></textarea>
            </div>
            <div>
              <button type="submit" className={styles.submitButton} disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {formStatus === 'success' && (
                <p className="text-center text-green-600">Thank you! Your message has been sent.</p>
            )}
            {formStatus === 'error' && (
                <p className="text-center text-red-600">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}