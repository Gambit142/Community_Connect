import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, clearCurrentUser } from '../../store/admin/adminSlice.js';
import axios from 'axios';
import styles from '../../assets/css/AdminSettings.module.css';

const apiUrl = import.meta.env.VITE_API_URL;

export default function EditUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser: user, currentUserLoading: loading, currentUserError: error } = useSelector(state => state.admin);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'member',
    userType: 'individual',
    bio: '',
    location: '',
  });

  useEffect(() => {
    dispatch(getUserById(userId));
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'member',
        userType: user.userType || 'individual',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/admin/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User updated successfully');
      navigate('/admin/users');
    } catch (err) {
      alert('Failed to update user');
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading user...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;
  if (!user) return <div className="text-white text-center py-20">User not found</div>;

  return (
    <div className={styles.gridContainer}>
      <div className={styles.card}>
        <h2 className="text-2xl font-bold mb-6 text-white">Edit User: {user.username}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Username</label></div>
            <div className={styles.formInputContainer}><input name="username" value={formData.username} onChange={handleChange} className={styles.formInput} required /></div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Email</label></div>
            <div className={styles.formInputContainer}><input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} required /></div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Role</label></div>
            <div className={styles.formInputContainer}>
              <select name="role" value={formData.role} onChange={handleChange} className={styles.formSelect}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>User Type</label></div>
            <div className={styles.formInputContainer}>
              <select name="userType" value={formData.userType} onChange={handleChange} className={styles.formSelect}>
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Bio</label></div>
            <div className={styles.formInputContainer}><textarea name="bio" value={formData.bio} onChange={handleChange} className={styles.formInput} rows="4" /></div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formLabelContainer}><label className={styles.formLabel}>Location</label></div>
            <div className={styles.formInputContainer}><input name="location" value={formData.location} onChange={handleChange} className={styles.formInput} /></div>
          </div>
          <div className={styles.formFooter}>
            <button type="button" onClick={() => navigate('/admin/users')} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}