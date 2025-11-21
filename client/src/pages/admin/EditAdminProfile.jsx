import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfileThunk } from '../../store/profile/profileThunks.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faMapMarkerAlt, faEdit, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/AdminSettings.module.css';

export default function EditAdminProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, successMessage } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    profilePic: null,
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        profilePic: null,
      });
      setPreview(user.profilePic || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, profilePic: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    if (formData.profilePic) data.append('profilePic', formData.profilePic);

    try {
      await dispatch(updateProfileThunk(data)).unwrap();
      navigate('/admin/settings');
    } catch (err) {
      // error handled by Redux
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
            Back to Settings
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-2">Update your admin profile information</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faEdit} className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.contentHeader}>
            <h2 className={styles.title}>Profile Information</h2>
            <p className={styles.subtitle}>Update your personal details and profile picture</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formBody}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                {successMessage}
              </div>
            )}

            {/* Profile Picture Section */}
            <div className={styles.formSection}>
              <div className={styles.formLabelContainer}>
                <label className={styles.formLabel}>Profile Picture</label>
                <p className={styles.formHint}>Recommended: 400x400px, JPG or PNG</p>
              </div>
              <div className={styles.formInputContainer}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg" 
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleChange} 
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Choose a new profile picture to upload
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className={styles.formSection}>
              <div className={styles.formLabelContainer}>
                <label className={styles.formLabel}>Username</label>
                <p className={styles.formHint}>Your display name across the platform</p>
              </div>
              <div className={styles.formInputContainer}>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                  />
                  <input 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className={`${styles.formInput} pl-10`}
                    placeholder="Enter your username"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className={styles.formSection}>
              <div className={styles.formLabelContainer}>
                <label className={styles.formLabel}>Email Address</label>
                <p className={styles.formHint}>Your primary contact email</p>
              </div>
              <div className={styles.formInputContainer}>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                  />
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`${styles.formInput} pl-10`}
                    placeholder="Enter your email address"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.formSection}>
              <div className={styles.formLabelContainer}>
                <label className={styles.formLabel}>Bio</label>
                <p className={styles.formHint}>Tell others about yourself</p>
              </div>
              <div className={styles.formInputContainer}>
                <textarea 
                  name="bio" 
                  rows="4" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  className={styles.formTextarea}
                  placeholder="Write a short bio about yourself..."
                />
              </div>
            </div>

            {/* Location */}
            <div className={styles.formSection}>
              <div className={styles.formLabelContainer}>
                <label className={styles.formLabel}>Location</label>
                <p className={styles.formHint}>Your city and country</p>
              </div>
              <div className={styles.formInputContainer}>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faMapMarkerAlt} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                  />
                  <input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className={`${styles.formInput} pl-10`}
                    placeholder="e.g., Brampton, ON, Canada"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button 
                type="button" 
                onClick={() => navigate('/admin/settings')} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className={styles.saveButton}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}