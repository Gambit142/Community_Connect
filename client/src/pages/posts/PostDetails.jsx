import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPostById, getSimilarPosts, clearCurrentPost } from '../../store/posts/postsSlice.js';
import styles from '../../assets/css/PostDetails.module.css';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPost, similarPosts, loading } = useSelector((state) => state.posts);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryPosition, setGalleryPosition] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(23);

  useEffect(() => {
    if (id) {
      dispatch(getPostById(id));
      dispatch(getSimilarPosts(id));
    }
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);

  useEffect(() => {
    const updateThumbWidth = () => {
      if (window.innerWidth < 480) {
        setThumbWidth(48);
      } else if (window.innerWidth < 768) {
        setThumbWidth(31);
      } else {
        setThumbWidth(23);
      }
    };
    updateThumbWidth();
    window.addEventListener('resize', updateThumbWidth);
    return () => window.removeEventListener('resize', updateThumbWidth);
  }, []);

  const galleryConfig = useMemo(() => {
    if (!currentPost?.images || currentPost.images.length === 0) {
      return { leftMin: 0, leftMax: 0, numVisible: 0 };
    }
    const numThumbs = currentPost.images.length;
    const totalWidth = numThumbs * thumbWidth;
    let leftMin, leftMax;
    if (totalWidth <= 100) {
      leftMin = 0;
      leftMax = 100 - totalWidth;
    } else {
      leftMin = 100 - totalWidth;
      leftMax = 0;
    }
    const numVisible = Math.floor(100 / thumbWidth);
    return { leftMin, leftMax, numVisible };
  }, [currentPost?.images, thumbWidth]);

  useEffect(() => {
    const { leftMin, leftMax } = galleryConfig;
    if (currentPost?.images && currentPost.images.length > 0) {
      const activeCenter = activeImageIndex * thumbWidth + thumbWidth / 2;
      const targetPosition = 50 - activeCenter;
      const clampedPosition = Math.max(leftMin, Math.min(leftMax, targetPosition));
      setGalleryPosition(clampedPosition);
    }
  }, [activeImageIndex, galleryConfig, currentPost?.images, thumbWidth]);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleNext = () => {
    if (currentPost?.images) {
      const nextIndex = (activeImageIndex + 1) % currentPost.images.length;
      setActiveImageIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentPost?.images) {
      const prevIndex = (activeImageIndex - 1 + currentPost.images.length) % currentPost.images.length;
      setActiveImageIndex(prevIndex);
    }
  };

  const moveGalleryPrev = () => {
    const { leftMin, leftMax } = galleryConfig;
    const newPos = galleryPosition + thumbWidth;
    const clamped = Math.max(leftMin, Math.min(leftMax, newPos));
    setGalleryPosition(clamped);
  };

  const moveGalleryNext = () => {
    const { leftMin, leftMax } = galleryConfig;
    const newPos = galleryPosition - thumbWidth;
    const clamped = Math.max(leftMin, Math.min(leftMax, newPos));
    setGalleryPosition(clamped);
  };

  const renderDetailValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className={styles.arrayList}>
          {value.map((item, index) => (
            <li key={index} className={styles.arrayItem}>
              {item}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([key, val]) => (
        <div key={key} className="mb-2">
          <span className="font-medium capitalize">{key}:</span>{' '}
          {renderDetailValue(val)}
        </div>
      ));
    }

    return <span>{value}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Post not found</div>
      </div>
    );
  }

  const { leftMin, leftMax, numVisible } = galleryConfig;
  const showNavButtons = showGallery && currentPost.images.length > numVisible;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-[#05213C] hover:text-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Posts
        </button>

        {/* Image Gallery */}
        <div className={styles.container}>
          <div
            className={styles.feature}
            onMouseEnter={() => setShowGallery(true)}
            onMouseLeave={() => setShowGallery(false)}
          >
            <div
              className={styles.featuredItem}
              style={{
                backgroundImage: `url(${currentPost.images?.[activeImageIndex] || '/placeholder-image.jpg'})`
              }}
            />

            {/* Gallery Controls */}
            <div className={`${styles.controls} ${showGallery ? styles.show : ''}`}>
              <button
                className={styles.moveBtn}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className={styles.moveBtn}
                onClick={handleNext}
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className={`${styles.galleryWrapper} ${showGallery ? styles.show : ''}`}>
            <div
              className={styles.gallery}
              style={{ left: `${galleryPosition}%` }}
            >
              {currentPost.images?.map((image, index) => (
                <div key={index} className={styles.itemWrapper}>
                  <div
                    className={`${styles.galleryItem} ${index === activeImageIndex ? styles.active : ''}`}
                    style={{ backgroundImage: `url(${image})` }}
                    onClick={() => handleImageClick(index)}
                  />
                </div>
              ))}
            </div>

            {/* Gallery Navigation */}
            {showNavButtons && (
              <div className="flex justify-center space-x-4 mt-2">
                <button
                  onClick={moveGalleryPrev}
                  disabled={galleryPosition >= leftMax}
                  className={`p-2 rounded-full ${galleryPosition >= leftMax ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#05213C] text-white hover:bg-blue-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={moveGalleryNext}
                  disabled={galleryPosition <= leftMin}
                  className={`p-2 rounded-full ${galleryPosition <= leftMin ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#05213C] text-white hover:bg-blue-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentPost.category === 'food' ? 'bg-red-100 text-red-800' :
                currentPost.category === 'tutoring' ? 'bg-blue-100 text-blue-800' :
                  currentPost.category === 'events' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {currentPost.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentPost.type === 'donation' ? 'bg-green-100 text-green-800' :
                currentPost.type === 'service' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                {currentPost.type}
              </span>
              {currentPost.price > 0 && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ${currentPost.price}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-[#05213C] mb-4">{currentPost.title}</h1>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{currentPost.location}</span>
              <span className="mx-2">•</span>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(currentPost.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.detailItem}>
            <h2 className={`${styles.detailLabel} text-xl`}>Description</h2>
            <p className={`${styles.detailValue} leading-relaxed`}>{currentPost.description}</p>
          </div>

          {/* Details */}
          {currentPost.details && Object.keys(currentPost.details).length > 0 && (
            <div className={styles.detailItem}>
              <h2 className={`${styles.detailLabel} text-xl`}>Details</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                {Object.entries(currentPost.details).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-[#05213C] capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className={styles.detailValue}>
                      {renderDetailValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className={styles.detailItem}>
              <h2 className={`${styles.detailLabel} text-xl`}>Tags</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar Posts */}
        {similarPosts && similarPosts.length > 0 && (
          <div className="mt-12">
            {/* Centered Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#05213C] inline-block">Similar Posts</h2>
            </div>

            {/* Centered and Aligned Cards */}
            <div className={styles.similarPostsContainer}>
              <div className={styles.similarPostsGrid}>
                {similarPosts.slice(0, 4).map((post) => (
                  <div
                    key={post._id}
                    className={styles.similarPostCard}
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    {/* Fixed height image container */}
                    <div className="h-48 w-full overflow-hidden">
                      {post.images && post.images.length > 0 ? (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-grow p-4">
                      {/* Fixed height badges section */}
                      <div className="flex flex-wrap gap-1 mb-3 min-h-[2rem] items-start">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${post.category === 'food' ? 'bg-red-100 text-red-800' :
                          post.category === 'tutoring' ? 'bg-blue-100 text-blue-800' :
                            post.category === 'events' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {post.category}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {post.price > 0 ? `$${post.price}` : 'Free'}
                        </span>
                      </div>

                      {/* Fixed height title - titles will align at bottom */}
                      <div className="min-h-[3rem] mb-3 flex items-start">
                        <h3 className={`${styles.similarPostTitle} line-clamp-2 w-full`}>
                          {post.title}
                        </h3>
                      </div>

                      {/* Flexible description - this can vary */}
                      <p className={`${styles.similarPostDescription} flex-grow`}>
                        {post.description}
                      </p>

                      {/* Fixed height metadata at bottom */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 min-h-[1.5rem]">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize">{post.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}