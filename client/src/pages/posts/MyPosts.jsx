import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPosts, clearError, deletePost } from '../../store/posts/postsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import PostDetailsModal from '../../components/PostDetailsModal.jsx';

export default function MyPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, pagination, loading, error, successMessage } = useSelector((state) => state.posts);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(getMyPosts(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);

  // Auto-hide success message after 5s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handlePostClick = (post) => {
    if (post.status === 'Published') {
      navigate(`/posts/${post._id}`);
    } else {
      setSelectedPost(post);
      setShowPostModal(true);
    }
  };

  const handleEdit = (post) => {
    navigate(`/posts/edit/${post._id}`);
  };

  const handleDelete = (postId) => {
    setDeleteConfirmId(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      dispatch(deletePost(deleteConfirmId)).unwrap().then(() => {
        dispatch(getMyPosts(filters)); // Refetch to update list
      }).catch(() => {
        // Error handled in slice
      });
      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
    }
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  const handleEditClick = () => {
    handleCloseModal();
    if (selectedPost) {
      navigate(`/posts/edit/${selectedPost._id}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading posts...</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Posts</h1>
          
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePostClick(post); }}>{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            post.status === 'Published' ? 'bg-green-100 text-green-800' :
                            post.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                            post.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            post.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="text-blue-600 hover:underline mr-2">
                            Edit
                          </button>
                          {post.status !== 'Archived' && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }} className="text-red-600 hover:underline">
                              Delete
                            </button>
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

      {/* Post Details Modal */}
      <PostDetailsModal 
        post={selectedPost} 
        onClose={handleCloseModal}
        showEditButton={selectedPost?.status === 'Rejected'}
        onEditClick={handleEditClick}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}