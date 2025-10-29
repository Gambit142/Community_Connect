// src/pages/events/CreateEvent.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/CreateEvent.module.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop', // Default category
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    // In a real app, you would dispatch a Redux thunk here.
    // For now, we simulate an API call.
    console.log('Submitting event data:', formData);
    
    setTimeout(() => {
      setLoading(false);
      // On success, navigate to the "My Events" page with a success message.
      navigate('/events/my-events', {
        state: {
          success: `Your event "${formData.title}" has been submitted for approval!`
        }
      });
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.formTitle}>Create a New Event</h1>
        <p className={styles.formSubtitle}>Fill out the details below to share your event with the community.</p>
        
        {error && (
            <div className={styles.errorMessage}>{error}</div>
        )}

        <div className={styles.field}>
          <label htmlFor="title" className={`${styles.label} ${styles.requiredLabel}`}>Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className={styles.textInput}
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Community Cleanup Day"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={`${styles.label} ${styles.requiredLabel}`}>Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            className={styles.textarea}
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Tell us more about your event..."
          />
        </div>
        
        <div className={`${styles.field} ${styles.fieldHalf}`}>
            <label htmlFor="date" className={`${styles.label} ${styles.requiredLabel}`}>Date</label>
            <input
                type="date"
                id="date"
                name="date"
                className={styles.textInput}
                value={formData.date}
                onChange={handleChange}
                required
            />
        </div>

        <div className={`${styles.field} ${styles.fieldHalf}`}>
            <label htmlFor="time" className={`${styles.label} ${styles.requiredLabel}`}>Time</label>
            <input
                type="time"
                id="time"
                name="time"
                className={styles.textInput}
                value={formData.time}
                onChange={handleChange}
                required
            />
        </div>

        <div className={styles.field}>
          <label htmlFor="location" className={`${styles.label} ${styles.requiredLabel}`}>Location or URL</label>
          <input
            type="text"
            id="location"
            name="location"
            className={styles.textInput}
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g., 123 Main St, Brampton or Online"
          />
        </div>
        
        <div className={styles.field}>
            <label htmlFor="category" className={`${styles.label} ${styles.requiredLabel}`}>Category</label>
            <select
                id="category"
                name="category"
                className={styles.select}
                value={formData.category}
                onChange={handleChange}
            >
                <option>Workshop</option>
                <option>Volunteer</option>
                <option>Market</option>
                <option>Tech</option>
                <option>Charity</option>
                <option>Fair</option>
                <option>Social</option>
                <option>Other</option>
            </select>
        </div>
        
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Event for Review'}
        </button>
      </form>
    </div>
  );
}