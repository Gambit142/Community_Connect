import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCheck,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { getFlaggedComments, unflagComment, clearFlaggedComments, clearFlaggedError } from '../../store/admin/adminSlice.js';
import { deleteFlaggedComment } from '../../store/admin/deleteFlaggedCommentThunk.js'; // New import
import { useNavigate } from 'react-router-dom';

const FlaggedComments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { flaggedComments, flaggedLoading, flaggedPagination, flaggedError, user } = useSelector((state) => ({
    flaggedComments: state.admin.flaggedComments,
    flaggedLoading: state.admin.flaggedLoading,
    flaggedPagination: state.admin.flaggedPagination,
    flaggedError: state.admin.flaggedError,
    user: state.login.user
  }));
  const [selectedComment, setSelectedComment] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    dispatch(clearFlaggedError());
    dispatch(getFlaggedComments({ page: 1, limit: 20 }));
    return () => {
      dispatch(clearFlaggedComments());
      dispatch(clearFlaggedError());
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch, navigate, user]);

  const handleSearch = useCallback((e) => {
    const search = e.target.value;
    setSearchInput(search);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getFlaggedComments({ search, page: 1, limit: 20 }));
    }, 600);
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(getFlaggedComments({ page, limit: 20, search: searchInput }));
  };

  const handleApprove = (commentId) => {
    if (window.confirm('Approve this comment? (Unflag and keep visible)')) {
      dispatch(unflagComment(commentId)).then(() => {
        // Refresh current page after approval
        dispatch(getFlaggedComments({
          page: flaggedPagination?.current || 1,
          limit: 20,
          search: searchInput
        }));
      });
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Delete this comment? (Soft delete - hidden from users)')) {
      await dispatch(deleteFlaggedComment(commentId)); // Use new admin thunk
      // Refresh current page after deletion
      dispatch(getFlaggedComments({
        page: flaggedPagination?.current || 1,
        limit: 20,
        search: searchInput
      }));
    }
  };

  const handleViewDetails = (comment) => {
    setSelectedComment(comment);
  };

  if (flaggedLoading) {
    return <div className="flex justify-center items-center h-64">Loading flagged comments...</div>;
  }

  if (flaggedError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {flaggedError}</p>
        <button onClick={() => dispatch(clearFlaggedError())} className="mt-2 text-blue-600 underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Flagged Comments ({flaggedPagination?.total || 0})</h1>
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchInput}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {flaggedComments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No flagged comments found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagged By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flaggedComments.map((comment) => (
                  <tr key={comment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{comment.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comment.flags?.map(f => f.username).join(', ') || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(comment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleApprove(comment._id)}
                        className="text-green-600 hover:text-green-900 ml-2"
                        title="Approve"
                        disabled={flaggedLoading}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                        title="Delete"
                        disabled={flaggedLoading}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Fixed to match backend structure */}
          {flaggedPagination && flaggedPagination.total > 0 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: flaggedPagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    flaggedPagination.current === page
                      ? 'bg-[#05213C] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Details Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Comment Details</h2>
              <div className="mb-4">
                <strong className="block mb-2">Content:</strong>
                <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedComment.content}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><strong>Flagged By:</strong> {selectedComment.flags?.map(f => f.username).join(', ') || 'Unknown'}</div>
                <div><strong>Date:</strong> {new Date(selectedComment.createdAt).toLocaleDateString()}</div>
                {selectedComment.relatedId && (
                  <div className="md:col-span-2">
                    <strong>Related to:</strong> <i>{selectedComment.relatedType.toUpperCase()}:</i> {selectedComment.relatedId.title}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedComment(null)}
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
};

export default FlaggedComments;