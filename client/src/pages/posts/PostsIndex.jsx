import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, clearError } from '../../store/posts/postsSlice.js';
import { useNavigate } from 'react-router-dom';
import SidebarFilter from '../../components/SidebarFilter.jsx';
import Pagination from '../../components/Pagination.jsx';

export default function PostsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, pagination, loading, error } = useSelector((state) => state.posts);
  const [filters, setFilters] = useState({ search: '', category: '', tags: '', page: 1, limit: 6 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getPosts(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset page on filter
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Community Resources</h1>
          <button onClick={() => navigate('/posts/create')} className="bg-[#05213C] text-white px-4 py-2 rounded-md hover:bg-gray-800">
            Create Post
          </button>
        </div>

        {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block h-full">
            <SidebarFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Mobile Toggle Button and Filters */}
          <div className="lg:hidden mb-4">
            <button
              onClick={toggleFilters}
              className="text-black font-medium mb-2"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <SidebarFilter filters={filters} onFilterChange={handleFilterChange} />
              </div>
            )}
          </div>

          {/* Posts Grid */}
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No posts found. Try adjusting filters.</p>
                <button onClick={() => navigate('/posts/create')} className="bg-[#05213C] text-white px-4 py-2 rounded-md hover:bg-gray-800">
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    {/* Fixed height image container */}
                    <div className="h-64 w-full overflow-hidden">
                      {post.images && post.images.length > 0 ? (
                        <img 
                          src={post.images[0]} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col h-full">
                      {/* Fixed height section for consistent alignment */}
                      <div className="flex items-center justify-between mb-3 min-h-[2rem]">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          post.category === 'food' ? 'bg-red-100 text-red-800' :
                          post.category === 'tutoring' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          post.type === 'donation' ? 'bg-green-100 text-green-800' :
                          post.type === 'service' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {post.type}
                        </span>
                      </div>

                      {/* Fixed height title section - titles will align at bottom */}
                      <div className="min-h-[3.5rem] mb-3 flex items-end">
                        <h3 className="text-lg font-semibold text-[#05213C] line-clamp-2 w-full">
                          {post.title}
                        </h3>
                      </div>

                      {/* Variable description section */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.description}
                      </p>

                      {/* Fixed height metadata section */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 min-h-[1.5rem]">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="ml-auto">
                          {post.price > 0 ? `$${post.price}` : 'Free'}
                        </span>
                      </div>

                      {/* Button pushed to bottom */}
                      <button
                        className="mt-auto w-full bg-[#05213C] text-white py-2 rounded-md hover:bg-gray-800"
                        onClick={() => navigate(`/posts/${post._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}