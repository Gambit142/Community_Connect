import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfileThunk } from '../../store/profile/profileThunks.js';
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

  if (loading && !user) return <div className="text-white text-center py-20">Loading...</div>;

  return (
    <div className={styles.gridContainer}>
      <div className={styles.card}>
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Your Admin Profile</h2>

        {error && <div className="bg-red-600 text-white p-4 rounded mb-6">{error}</div>}
        {successMessage && <div className="bg-green-600 text-white p-4 rounded mb-6">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}>
              <label className={styles.formLabel}>Profile Picture</label>
            </div>
            <div className={styles.formInputContainer}>
              <div className="flex items-center gap-6">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-28 h-28 rounded-full object-cover border-4 border-gray-300" />
                ) : (
                  <div className="w-28 h-28 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600">
                    {user?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleChange} className={styles.formInput} />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Username</label></div>
            <div className={styles.formInputContainer}><input name="username" value={formData.username} onChange={handleChange} className={styles.formInput} required /></div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Email</label></div>
            <div className={styles.formInputContainer}><input name="email" type="email" value={formData.email} onChange={handleChange} className={styles.formInput} required /></div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Bio</label></div>
            <div className={styles.formInputContainer}><textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className={styles.formInput} /></div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Location</label></div>
            <div className={styles.formInputContainer}><input name="location" value={formData.location} onChange={handleChange} className={styles.formInput} placeholder="e.g., Brampton, ON" /></div>
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => navigate('/admin/settings')} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}