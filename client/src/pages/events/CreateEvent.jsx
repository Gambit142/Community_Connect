import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, clearError } from '../../store/events/eventsSlice.js'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/CreateEvent.module.css';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop', // Default category
    price: 0, // Added price field
  });
  const [images, setImages] = useState([]);
  const [clientError, setClientError] = useState(''); // Local state for client-side errors
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.events); // Adjust slice name as needed

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError(''); // Clear previous client errors

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
      price: parseFloat(formData.price) || 0, // Parse price as float
      images,
    };

    // Dispatch the createEvent action
    dispatch(createEvent(submitData)).unwrap().then((result) => {
      // On success, navigate immediately with the message in state
      navigate('/events/my-events', { 
        state: { 
          success: result.message || `Your event "${formData.title}" has been submitted for approval!`
        } 
      });
    }).catch(() => {
      // Errors are already handled via Redux
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
      e.target.value = ''; // Clear the input
      setImages([]);
      return;
    }
    setClientError(''); // Clear error if valid
    setImages(selectedFiles);
  };

  // Clear client error when server error changes (to avoid overlap)
  useEffect(() => {
    if (error) {
      setClientError('');
    }
  }, [error]);

  // Show server errors in clientError if no client error
  const displayError = clientError || error;

  return (
    <div className="min-h-screen bg-[#111111] py-12 px-4 font-sans antialiased">
      <form onSubmit={handleSubmit} className={`${styles.form} max-w-[48em] mx-auto relative`}>
        
        {/* Error Messages Only (No Success Here) */}
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
            Event Images (up to 5)
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
            value={loading ? 'Submitting...' : 'Submit Event'}
            disabled={loading}
          />
        </p>
      </form>
    </div>
  );
}