// src/pages/profile/EditProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../../assets/css/EditProfile.module.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.login.user);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Pre-populate form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        bio: currentUser.bio || 'Passionate about building stronger communities.', // Mock bio
        location: currentUser.location || 'Brampton, ON', // Mock location
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to update profile
    console.log('Updating profile with:', formData);

    setTimeout(() => {
      setLoading(false);
      setSuccess('Profile updated successfully!');
      // Redirect back to profile page after a short delay
      setTimeout(() => navigate('/profile'), 2000);
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Edit Your Profile</h1>
        <p className={styles.formSubtitle}>Keep your community profile up to date.</p>
        
        {success && (
          <div className={styles.successMessage}>{success}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={styles.input}
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio" className={styles.label}>Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              className={styles.textarea}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell the community a little about yourself..."
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="location" className={styles.label}>Location</label>
            <input
              type="text"
              id="location"
              name="location"
              className={styles.input}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Brampton, ON"
            />
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}