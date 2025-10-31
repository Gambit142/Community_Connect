// New file: src/pages/events/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, clearError, getEventById } from '../../store/events/eventsSlice.js';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../assets/css/CreateEvent.module.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEvent, loading, error } = useSelector((state) => state.events);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    price: 0,
  });
  const [images, setImages] = useState([]);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        title: currentEvent.title || '',
        description: currentEvent.description || '',
        date: currentEvent.date ? new Date(currentEvent.date).toISOString().split('T')[0] : '',
        time: currentEvent.time || '',
        location: currentEvent.location || '',
        category: currentEvent.category || 'Workshop',
        price: currentEvent.price || 0,
      });
      setImages(currentEvent.images || []);
    }
  }, [currentEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    // Client-side validation for required fields
    if (!formData.title.trim()) {
      setClientError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setClientError('Description is required');
      return;
    }
    if (!formData.date) {
      setClientError('Date is required');
      return;
    }
    if (!formData.time) {
      setClientError('Time is required');
      return;
    }
    if (!formData.location.trim()) {
      setClientError('Location is required');
      return;
    }

    // Client-side check for images count
    if (images.length > 5) {
      setClientError('Maximum 5 images allowed');
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      location: formData.location.trim(),
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      images,
    };

    dispatch(updateEvent({ eventId: id, eventData: submitData })).unwrap().then((result) => {
      navigate('/events/my-events', { 
        state: { 
          success: result.message || 'Event updated successfully' 
        } 
      });
    }).catch(() => {
      // Errors handled via Redux
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      setClientError('Maximum 5 images allowed');
      e.target.value = '';
      setImages([]);
      return;
    }
    setClientError('');
    setImages(selectedFiles);
  };

  useEffect(() => {
    if (error) {
      setClientError('');
    }
  }, [error]);

  const displayError = clientError || error;

  if (!currentEvent && !loading) {
    return <div className="min-h-screen flex items-center justify-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#111111] py-12 px-4 font-sans antialiased">
      <form onSubmit={handleSubmit} className={`${styles.form} max-w-[48em] mx-auto relative`}>
        
        {displayError && (
          <div className="w-full mb-8 p-4 bg-red-600 text-white rounded text-lg">
            {displayError}
          </div>
        )}

        {/* Title - Required */}
        <p className={`${styles.field} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="title">
            Event Title
          </label>
          <input
            className={styles.textInput}
            id="title"
            name="title"
            required
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Community Cleanup Day"
          />
        </p>

        {/* Description - Required */}
        <p className={`${styles.field} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="description">
            Description
          </label>
          <textarea
            className={styles.textarea}
            id="description"
            name="description"
            required
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us more about your event..."
          />
        </p>
        
        {/* Date & Time - Half Width */}
        <p className={`${styles.field} ${styles.fieldHalf} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="date">
            Date
          </label>
          <input
            className={styles.textInput}
            id="date"
            name="date"
            required
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </p>

        <p className={`${styles.field} ${styles.fieldHalf} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="time">
            Time
          </label>
          <input
            className={styles.textInput}
            id="time"
            name="time"
            required
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </p>

        {/* Location - Required */}
        <p className={`${styles.field} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="location">
            Location or URL
          </label>
          <input
            className={styles.textInput}
            id="location"
            name="location"
            required
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., 123 Main St, Brampton or Online"
          />
        </p>

        {/* Category & Price - Half Width */}
        <p className={`${styles.field} ${styles.fieldHalf} ${styles.required} mb-8`}>
          <label className={`${styles.label} ${styles.labelRequired} block text-white font-bold mb-3`} htmlFor="category">
            Category
          </label>
          <select 
            className={styles.select}
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Workshop">Workshop</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Market">Market</option>
            <option value="Tech">Tech</option>
            <option value="Charity">Charity</option>
            <option value="Fair">Fair</option>
            <option value="Social">Social</option>
            <option value="Other">Other</option>
          </select>
        </p>

        <p className={`${styles.field} ${styles.fieldHalf} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="price">
            Price (0 for free)
          </label>
          <input
            className={styles.textInput}
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
          />
        </p>

        {/* Images */}
        <p className={`${styles.field} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="images">
            Event Images (up to 5, current: {images.length})
          </label>
          <input
            className={styles.textInput}
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          {images.length > 0 && !clientError && (
            <p className="text-base text-gray-400 mt-3">{images.length} files selected</p>
          )}
        </p>
        
        {/* Submit Button */}
        <p className={`${styles.field} ${styles.fieldHalf} mb-8`}>
          <input
            className={`${styles.button} w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            value={loading ? 'Updating...' : 'Update Event'}
            disabled={loading}
          />
        </p>
      </form>
    </div>
  );
}