import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFlaggedComments, unflagComment, clearFlaggedComments, clearFlaggedError } from '../../store/admin/adminSlice.js';
import { deleteComment } from '../../store/comments/commentThunks.js'; // Reuse existing
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

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    dispatch(getFlaggedComments({ page: 1, limit: 20 }));
    return () => {
      dispatch(clearFlaggedComments());
      dispatch(clearFlaggedError());
    };
  }, [dispatch, navigate, user]);

  const handleApprove = (commentId) => {
    if (window.confirm('Approve this comment? (Unflag and keep visible)')) {
      dispatch(unflagComment(commentId));
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Delete this comment? (Soft delete - hidden from users)')) {
      // Use generic delete (assumes resourceType/resourceId not needed for admin delete)
      await dispatch(deleteComment({ resourceType: 'comment', resourceId: 'admin', commentId }));
      // Refetch to update list
      dispatch(getFlaggedComments({ page: 1, limit: 20 }));
    }
  };

  if (flaggedLoading) {
    return <div className="flex justify-center py-8">Loading flagged comments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Flagged Comments ({flaggedPagination?.total || 0})</h1>
      
      {flaggedError && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">{flaggedError}</div>}

      {flaggedComments.length === 0 ? (
        <p>No flagged comments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Content</th>
                <th className="px-4 py-2 border-b text-left">Flagged By</th>
                <th className="px-4 py-2 border-b text-left">Resource</th>
                <th className="px-4 py-2 border-b text-left">Date</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedComments.map((comment) => (
                <tr key={comment._id}>
                  <td className="px-4 py-2 border-b">
                    <p className="text-sm max-w-xs truncate">{comment.content}</p>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span className="text-sm">{comment.flags?.map(f => f.username).join(', ') || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <a 
                      href={`/${comment.relatedType}s/${comment.relatedId._id}`} 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {comment.relatedId.title}
                    </a>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span className="text-sm">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(comment._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {flaggedPagination && flaggedPagination.pages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: flaggedPagination.pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => dispatch(getFlaggedComments({ page: i + 1, limit: 20 }))}
              className={`px-3 py-1 rounded ${flaggedPagination.current === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedComments;