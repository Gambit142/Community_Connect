import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, clearError } from '../../store/posts/postsSlice.js';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faMapMarkerAlt, faTag, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

export default function PostsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, pagination, loading, error } = useSelector((state) => state.posts);
  const [filters, setFilters] = useState({ search: '', category: '', tags: '', page: 1, limit: 6 });
  const [searchInput, setSearchInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const debounceRef = useRef(null);
  const debounceRefTags = useRef(null);

  // Post categories
  const postCategories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'ridesharing', label: 'Ridesharing' },
    { value: 'housing', label: 'Housing' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'goods', label: 'Goods' },
    { value: 'events', label: 'Events' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'financial', label: 'Financial' },
  ];

  // Debounced function for search
  const debouncedSearch = useCallback((searchValue) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
    }, 600);
  }, []);

  // Debounced function for tags
  const debouncedTags = useCallback((tagsValue) => {
    if (debounceRefTags.current) {
      clearTimeout(debounceRefTags.current);
    }
    debounceRefTags.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, tags: tagsValue, page: 1 }));
    }, 600);
  }, []);

  useEffect(() => {
    dispatch(getPosts(filters));
    return () => {
      dispatch(clearError());
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (debounceRefTags.current) {
        clearTimeout(debounceRefTags.current);
      }
    };
  }, [dispatch, filters.search, filters.category, filters.tags, filters.page]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleTagsChange = useCallback((e) => {
    const value = e.target.value;
    setTagsInput(value);
    debouncedTags(value);
  }, [debouncedTags]);

  const handleCategoryChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, category: value, page: 1 }));
    setShowCategoryDropdown(false);
  }, []);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getCurrentCategoryLabel = () => {
    const category = postCategories.find(cat => cat.value === filters.category);
    return category ? category.label : 'All Categories';
  };

  const clearFilters = () => {
    setSearchInput('');
    setTagsInput('');
    setFilters({ search: '', category: '', tags: '', page: 1, limit: 6 });
  };

  const hasActiveFilters = filters.search || filters.category || filters.tags;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'donation': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-yellow-100 text-yellow-800';
      case 'request': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'food': return 'bg-red-100 text-red-800';
      case 'tutoring': return 'bg-blue-100 text-blue-800';
      case 'housing': return 'bg-indigo-100 text-indigo-800';
      case 'jobs': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Resources</h1>
            <p className="text-gray-600">Find and share resources, services, and opportunities in your community</p>
          </div>
          <button 
            onClick={() => navigate('/posts/create')} 
            className="bg-[#05213C] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <FontAwesomeIcon icon={faTag} />
            Create Post
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Tags Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faTag} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Filter by tags (comma separated)"
                value={tagsInput}
                onChange={handleTagsChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                  <span>{getCurrentCategoryLabel()}</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {postCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        filters.category === cat.value ? 'bg-[#05213C] text-white' : 'text-gray-700'
                      } ${cat.value === '' ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        filters.category === cat.value ? 'bg-white' : 'bg-gray-300'
                      }`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters and Clear Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 flex-1">
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{filters.search}"
                    <button 
                      onClick={() => {
                        setSearchInput('');
                        setFilters(prev => ({ ...prev, search: '' }));
                      }}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Category: {getCurrentCategoryLabel()}
                    <button 
                      onClick={() => handleCategoryChange('')}
                      className="ml-2 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.tags && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Tags: {filters.tags}
                    <button 
                      onClick={() => {
                        setTagsInput('');
                        setFilters(prev => ({ ...prev, tags: '' }));
                      }}
                      className="ml-2 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05213C] mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading posts...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faTag} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or clear filters to see more posts."
                    : "Be the first to share resources in your community!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {hasActiveFilters ? (
                    <button 
                      onClick={clearFilters}
                      className="bg-[#05213C] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <button 
                    onClick={() => navigate('/posts/create')} 
                    className="border border-[#05213C] text-[#05213C] px-6 py-3 rounded-lg hover:bg-[#05213C] hover:text-white transition-colors"
                  >
                    Create First Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{posts.length}</span> of{' '}
                  <span className="font-semibold">{pagination.totalPosts}</span> posts
                </p>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100">
                    {/* Fixed height image container with animation */}
                    <div className="h-64 w-full overflow-hidden relative">
                      {post.images && post.images.length > 0 ? (
                        <img 
                          src={post.images[0]} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <FontAwesomeIcon icon={faTag} className="text-gray-400 text-4xl" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Category and Type badges */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(post.type)}`}>
                          {post.type}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="mb-4 flex items-start">
                        <h3 className="text-xl font-bold text-[#05213C] line-clamp-2 w-full leading-tight">
                          {post.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.description}
                      </p>

                      {/* Metadata */}
                      <div className="space-y-3 mb-6 mt-auto">
                        {/* Location */}
                        {post.location && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="line-clamp-1">{post.location}</span>
                          </div>
                        )}
                        
                        {/* Price and Date */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3 text-gray-400" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <span className={`font-semibold ${
                            post.price > 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {post.price > 0 ? `$${post.price}` : 'Free'}
                          </span>
                        </div>
                      </div>

                      {/* Button */}
                      <button
                        className="w-full bg-[#05213C] text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-md hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/posts/${post._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}