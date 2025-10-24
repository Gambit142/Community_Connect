import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPosts, clearError } from '../../store/posts/postsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MyPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, pagination, loading, error } = useSelector((state) => state.posts);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 }); // status undefined for all
  const [successMessage, setSuccessMessage] = useState(location.state?.success || null); // From nav state

  useEffect(() => {
    dispatch(getMyPosts(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);

  // Auto-hide success message after 5s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 })); // undefined for all
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>
        
        {/* Success Message from Nav State */}
        {successMessage && (
          <div className="w-full mb-4 p-4 bg-green-600 text-white rounded text-lg">
            {successMessage}
          </div>
        )}
        
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={() => handleStatusFilter('')} className={`px-4 py-2 rounded ${!filters.status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
            <button onClick={() => handleStatusFilter('Pending Approval')} className={`px-4 py-2 rounded ${filters.status === 'Pending Approval' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}>Pending</button>
            <button onClick={() => handleStatusFilter('Published')} className={`px-4 py-2 rounded ${filters.status === 'Published' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Published</button>
            <button onClick={() => handleStatusFilter('Rejected')} className={`px-4 py-2 rounded ${filters.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Rejected</button>
          </div>
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts found. <button onClick={() => navigate('/posts/create')} className="text-blue-600 hover:underline">Create one</button></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason (if rejected)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          post.status === 'Published' ? 'bg-green-100 text-green-800' :
                          post.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.status === 'Rejected' && post.rejectionReason ? (
                          <span className="italic text-red-600">{post.rejectionReason}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && (
            <div className="flex justify-center space-x-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded ${page === filters.page ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => navigate('/posts/create')} className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800">
          Create New Post
        </button>
      </div>
    </div>
  );
}