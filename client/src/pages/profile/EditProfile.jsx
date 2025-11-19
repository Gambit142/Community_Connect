// src/pages/profile/EditProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfileThunk } from '../../store/profile/profileThunks.js';
import { clearMessages } from '../../store/profile/profileSlice.js';
import styles from '../../assets/css/EditProfile.module.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user: reduxUser, loading: profileLoading, error, successMessage } = useSelector((state) => state.profile);
  const loginUser = useSelector((state) => state.login.user); // Fallback during init

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    profilePic: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Load profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Populate form when profile loads
  useEffect(() => {
    if (reduxUser) {
      setFormData({
        username: reduxUser.username || '',
        bio: reduxUser.bio || '',
        location: reduxUser.location || '',
        profilePic: null,
      });
      setPreviewUrl(reduxUser.profilePic || '');
    }
  }, [reduxUser]);

  // Clear messages on unmount
  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData(prev => ({ ...prev, profilePic: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    dispatch(clearMessages());

    const data = new FormData();
    data.append('username', formData.username);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    if (formData.profilePic) data.append('profilePic', formData.profilePic);

    try {
      await dispatch(updateProfileThunk(data)).unwrap();
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      // Error already in Redux state
    } finally {
      setSaving(false);
    }
  };

  const currentUser = reduxUser || loginUser;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Edit Your Profile</h1>
        <p className={styles.formSubtitle}>Keep your community profile up to date.</p>
        
        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Profile Picture */}
          <div className={styles.field}>
            <label className={styles.label}>Profile Picture</label>
            <div className="flex items-center gap-6">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
              ) : currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="Current" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

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
              disabled={profileLoading}
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
              disabled={saving || profileLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving || profileLoading}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}