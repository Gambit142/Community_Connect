import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearError } from '../../store/posts/postsSlice.js';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/CreatePost.module.css';

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    tags: '', // String for input
    type: 'donation',
    price: 0,
    location: '',
    detailsRaw: '', // Raw string for textarea input
  });
  const [images, setImages] = useState([]);
  const [clientError, setClientError] = useState(''); // Local state for client-side errors
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.posts); // No longer select successMessage here

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

    // Client-side check for images count
    if (images.length > 5) {
      setClientError('Maximum 5 images allowed');
      return;
    }

    // Parse detailsRaw to object for submit
    let details = {};
    try {
      details = formData.detailsRaw ? JSON.parse(formData.detailsRaw) : {};
    } catch {
      setClientError('Invalid JSON in details—use valid format like {"quantity": 5}');
      return;
    }

    // Convert tags string to array for thunk
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      type: formData.type,
      price: parseFloat(formData.price) || 0,
      location: formData.location.trim(),
      details, // Explicitly add parsed details object
      images,
    };

    dispatch(createPost(submitData)).unwrap().then((result) => {
      // On success, navigate immediately with the message in state
      navigate('/posts/my-posts', { 
        state: { 
          success: result.message || 'Post created successfully and pending approval' 
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
            Title
          </label>
          <input
            className={styles.textInput}
            id="title"
            name="title"
            required
            type="text"
            value={formData.title}
            onChange={handleChange}
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
          />
        </p>

        {/* Category & Type - Half Width */}
        <p className={`${styles.field} ${styles.fieldHalf} ${styles.required} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="category">
            Category
          </label>
          <select 
            className={styles.select}
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="food">Food</option>
            <option value="tutoring">Tutoring</option>
            <option value="ridesharing">Ridesharing</option>
            <option value="housing">Housing</option>
            <option value="jobs">Jobs</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="goods">Goods</option>
            <option value="events">Events</option>
            <option value="transportation">Transportation</option>
            <option value="financial">Financial</option>
          </select>
        </p>

        <p className={`${styles.field} ${styles.fieldHalf} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="type">
            Type
          </label>
          <select 
            className={styles.select}
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="donation">Donation</option>
            <option value="service">Service</option>
            <option value="request">Request</option>
          </select>
        </p>

        {/* Tags */}
        <p className={`${styles.field} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            className={styles.textInput}
            id="tags"
            name="tags"
            type="text"
            placeholder="free, urgent"
            value={formData.tags}
            onChange={handleChange}
          />
        </p>

        {/* Price & Location - Half Width */}
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
            value={formData.price}
            onChange={handleChange}
          />
        </p>

        <p className={`${styles.field} ${styles.fieldHalf} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="location">
            Location
          </label>
          <input
            className={styles.textInput}
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
        </p>

        {/* Images */}
        <p className={`${styles.field} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="images">
            Images (up to 5)
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

        {/* Details JSON */}
        <p className={`${styles.field} mb-8`}>
          <label className={`${styles.label} block text-white font-bold mb-3`} htmlFor="detailsRaw">
            Details (JSON, optional)
          </label>
          <textarea
            className={styles.textarea}
            id="detailsRaw"
            name="detailsRaw"
            placeholder='{"quantity": 5, "expiry": "2025-10-20"}'
            rows="3"
            value={formData.detailsRaw}
            onChange={(e) => setFormData(prev => ({ ...prev, detailsRaw: e.target.value }))}
          />
        </p>

        {/* Submit Button */}
        <p className={`${styles.field} ${styles.fieldHalf} mb-8`}>
          <input
            className={`${styles.button} w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            value={loading ? 'Creating...' : 'Create Post'}
            disabled={loading}
          />
        </p>
      </form>
    </div>
  );
}