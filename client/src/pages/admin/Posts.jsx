import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCog,
  faCheck,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { getPendingPosts, approvePost, rejectPost, setPostFilters, clearPostError } from '../../store/admin/adminSlice.js';

export default function Posts() {
  const dispatch = useDispatch();
  const { posts, postPagination: pagination, postLoading: loading, postError: error, postFilters: filters } = useSelector((state) => state.admin);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [rejectReason, setRejectReason] = useState(''); 
  const [showRejectModal, setShowRejectModal] = useState(false); 
  const [rejectPostId, setRejectPostId] = useState(null); 
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setSearchInput(filters.search || '');
    dispatch(clearPostError());
    dispatch(getPendingPosts({ page: 1 })); // Initial load
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch, filters.search]);

  const handleSearch = useCallback((e) => {
    const search = e.target.value;
    setSearchInput(search);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setPostFilters({ search, page: 1 }));
      dispatch(getPendingPosts({ search, page: 1 }));
    }, 600); // Debounce 600ms
  }, [dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(setPostFilters({ page }));
    dispatch(getPendingPosts({ ...filters, page })); // Pass current filters + new page
  };

  const handleApprove = (postId) => {
    dispatch(approvePost(postId)).then(() => {
      dispatch(getPendingPosts({ ...filters, page: currentPage })); // Refetch current page
    });
  };

  const handleRejectConfirm = (postId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    dispatch(rejectPost({ postId, reason: rejectReason })).then(() => {
      dispatch(getPendingPosts({ ...filters, page: currentPage })); // Refetch
      setShowRejectModal(false);
      setRejectReason('');
      setRejectPostId(null);
    });
  };

  const handleReject = (postId) => {
    setRejectPostId(postId);
    setShowRejectModal(true);
  };

  const handleView = (post) => {
    setSelectedPost(post);
  };

  const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Published':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
      case 'Pending Approval':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
      case 'Rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
      case 'Archived':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const ActionDropdown = ({ postId, status }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (status !== 'Pending Approval') {
      return <span className="text-gray-400">N/A</span>;
    }

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <button
              onClick={() => { handleView(posts.find(p => p._id === postId)); setIsOpen(false); }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              View Details
            </button>
            <button
              onClick={() => { handleApprove(postId); setIsOpen(false); }}
              className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
            >
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              Publish
            </button>
            <button
              onClick={() => { handleReject(postId); setIsOpen(false); }}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  const totalPages = pagination ? pagination.totalPages : 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="mt-2 text-gray-600">Manage and moderate community posts</p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search posts..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05213C] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading posts...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.userID?.username || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{post.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">0</div> {/* Placeholder */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionDropdown postId={post._id} status={post.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination?.totalPosts || 0)} of {pagination?.totalPosts || 0} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                        currentPage === 1 
                          ? 'bg-gray-200 text-gray-500' 
                          : 'bg-[#05213C] text-white hover:bg-white hover:text-[#05213C] border border-[#05213C]'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-[#05213C] text-white' 
                            : 'bg-white text-[#05213C] hover:bg-[#05213C] hover:text-white border border-[#05213C]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                        currentPage === totalPages 
                          ? 'bg-gray-200 text-gray-500' 
                          : 'bg-[#05213C] text-white hover:bg-white hover:text-[#05213C] border border-[#05213C]'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Reject Post</h2>
              <p className="text-gray-600 mb-4">Provide a reason for rejection (min 10 chars):</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-32 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter rejection reason..."
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectConfirm(rejectPostId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{selectedPost.title}</h2>
              <p className="text-gray-600 mb-4">{selectedPost.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><strong>Category:</strong> {selectedPost.category}</div>
                <div><strong>Type:</strong> {selectedPost.type}</div>
                {selectedPost.price > 0 && <div><strong>Price:</strong> ${selectedPost.price}</div>}
                {selectedPost.location && <div><strong>Location:</strong> {selectedPost.location}</div>}
                {selectedPost.originalPostId && <div><strong>Original Post ID:</strong> {selectedPost.originalPostId}</div>}
              </div>
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {selectedPost.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Post" className="w-full h-20 object-cover rounded" />
                  ))}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}