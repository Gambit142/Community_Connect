import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPosts, clearError, deletePost } from '../../store/posts/postsSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import PostDetailsModal from '../../components/PostDetailsModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faPlus,
  faFilter,
  faCalendarDay,
  faTag,
  faDollarSign,
  faMapMarkerAlt,
  faBan,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

export default function MyPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, pagination, loading, error, successMessage } = useSelector((state) => state.posts);
  const [filters, setFilters] = useState({ status: undefined, page: 1, limit: 10 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(getMyPosts(filters));
    return () => dispatch(clearError());
  }, [dispatch, filters]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearError()), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (location.state?.success) {
      const timer = setTimeout(() => {
        navigate('.', { replace: true, state: null });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.success, navigate]);

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

  const handleEditPost = (post, e) => {
    e.stopPropagation();
    navigate(`/posts/edit/${post._id}`);
  };

  const handleDeletePost = (post, e) => {
    e.stopPropagation();
    setDeleteConfirm(post._id);
  };

  const cancelDelete = () => setDeleteConfirm(null);
  const confirmDelete = async () => {
    try {
      await dispatch(deletePost(deleteConfirm)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  const getStatusBadge = (status, rejectionReason) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Published':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
          Published
        </span>;
      case 'Pending Approval':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <FontAwesomeIcon icon={faClock} className="mr-1 w-3 h-3" />
          Pending
        </span>;
      case 'Rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <FontAwesomeIcon icon={faBan} className="mr-1 w-3 h-3" />
          Rejected
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'food': return 'bg-red-100 text-red-800';
      case 'tutoring': return 'bg-blue-100 text-blue-800';
      case 'housing': return 'bg-indigo-100 text-indigo-800';
      case 'jobs': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-pink-100 text-pink-800';
      case 'education': return 'bg-purple-100 text-purple-800';
      case 'goods': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'donation': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-yellow-100 text-yellow-800';
      case 'request': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-2">Manage your created posts and track their status.</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="w-full mb-6 p-4 bg-green-600 text-white rounded-lg text-lg shadow">
            {successMessage}
          </div>
        )}

        {/* Header with Filters */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/posts/create')}
              className="bg-[#05213C] text-white px-4 py-2 rounded-lg hover:bg-[#041a2f] transition-colors flex items-center space-x-2 text-sm"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Create New Post</span>
            </button>
            <div className="relative">
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#05213C] text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending Approval">Pending</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
              <FontAwesomeIcon icon={faFilter} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          {pagination?.totalPosts > 0 && (
            <p className="text-sm text-gray-600">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalPosts)} of {pagination.totalPosts} posts
            </p>
          )}
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

        {/* Posts Table */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category & Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price & Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr 
                        key={post._id}
                        className={`hover:bg-gray-50 transition-colors ${post.status === 'Rejected' ? 'opacity-60' : 'cursor-pointer'}`}
                        onClick={() => handlePostClick(post)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className={`text-sm font-medium ${post.status === 'Rejected' ? 'text-gray-500' : 'text-gray-900'} line-clamp-2`}>
                              {post.title}
                            </div>
                            {post.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {post.description}
                              </div>
                            )}
                            {post.status === 'Rejected' && post.rejectionReason && (
                              <div className="text-sm text-red-600 mt-1 italic">
                                Reason: {post.rejectionReason}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                                <FontAwesomeIcon icon={faTag} className="mr-1 w-3 h-3" />
                                {post.category}
                              </span>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                                {post.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-[#05213C] w-4 h-4" />
                              <span className={post.price > 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                {post.price > 0 ? `$${post.price}` : 'Free'}
                              </span>
                            </div>
                            {post.location && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#05213C] w-4 h-4" />
                                <span className="text-gray-600 text-sm line-clamp-1">{post.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-[#05213C] w-4 h-4" />
                            {new Date(post.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(post.status, post.rejectionReason)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => handleEditPost(post, e)}
                              disabled={post.status === 'Rejected'}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={(e) => handleDeletePost(post, e)}
                              className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faPlus} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-4">Create your first post to get started.</p>
              <button
                onClick={() => navigate('/posts/create')}
                className="bg-[#05213C] text-white px-6 py-2 rounded-lg hover:bg-[#041a2f] transition-colors"
              >
                Create Post
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(filters.page * filters.limit, pagination.totalPosts)}</span> of{' '}
                <span className="font-medium">{pagination.totalPosts}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Details Modal */}
      <PostDetailsModal
        post={selectedPost}
        onClose={handleCloseModal}
        showEditButton={selectedPost?.status === 'Rejected'}
        onEditClick={() => {
          handleCloseModal();
          if (selectedPost) {
            navigate(`/posts/edit/${selectedPost._id}`);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faTrash} className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                <p className="text-gray-600">Are you sure you want to delete this post?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}