import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearError } from '../../store/posts/postsSlice.js';
import { useNavigate } from 'react-router-dom';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.posts);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    // Parse detailsRaw to object for submit
    let details = {};
    try {
      details = formData.detailsRaw ? JSON.parse(formData.detailsRaw) : {};
    } catch {
      console.warn('Invalid JSON in details—using empty object');
    }
    // Convert tags string to array for thunk
    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      type: formData.type,
      price: formData.price,
      location: formData.location,
      details, // Explicitly add parsed details object
      images,
    };
    dispatch(createPost(submitData));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSuccess = () => {
    if (successMessage) {
      setTimeout(() => {
        navigate('/posts/my-posts');
      }, 2000);
    }
  };

  React.useEffect(() => {
    handleSuccess();
    return () => dispatch(clearError());
  }, [successMessage, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md">
              <option value="donation">Donation</option>
              <option value="service">Service</option>
              <option value="request">Request</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="free, urgent"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (0 for free)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images (up to 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
            {images.length > 0 && <p className="text-sm text-gray-500 mt-1">{images.length} files selected</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Details (JSON, optional)</label>
            <textarea
              placeholder='{"quantity": 5, "expiry": "2025-10-20"}'
              value={formData.detailsRaw}
              onChange={(e) => setFormData(prev => ({ ...prev, detailsRaw: e.target.value }))}
              rows={3}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}