import React from 'react';

export default function PostDetailsModal({ post, onClose, showEditButton = false, onEditClick }) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.description}</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div><strong>Category:</strong> {post.category}</div>
            <div><strong>Type:</strong> {post.type}</div>
            {post.price > 0 && <div><strong>Price:</strong> ${post.price}</div>}
            {post.location && <div><strong>Location:</strong> {post.location}</div>}
            {post.status === 'Rejected' && post.rejectionReason && (
              <div className="col-span-2"><strong>Rejection Reason:</strong> <span className="text-red-600">{post.rejectionReason}</span></div>
            )}
          </div>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt="Post" className="w-full h-20 object-cover rounded" />
              ))}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Close
            </button>
            {showEditButton && (
              <button
                onClick={onEditClick}
                className="px-4 py-2 bg-[#05213C] text-white rounded hover:bg-white hover:text-[#05213C] border border-[#05213C] transition-colors"
              >
                Edit & Resubmit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}