const { getPostById, getSimilarPosts } = require('../../src/controllers/posts/getPostController.js');
const Post = require('../../src/models/Post.js');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('../../src/models/Post.js');
jest.mock('jsonwebtoken');

describe('Get Post Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { 
      params: { id: '507f1f77bcf86cd799439011' }, // Default valid string ID
      headers: {} 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console errors in tests
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getPostById', () => {
    it('should return published post without auth', async () => {
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockUserId = '507f191e810c19729de860ea';
      const mockPost = {
        _id: mockPostId,
        title: 'Test Post',
        status: 'Published',
        userID: mockUserId,
        toObject: jest.fn(() => ({
          _id: mockPostId,
          title: 'Test Post',
          status: 'Published',
          // userID not included (deleted in controller)
        })),
      };
      Post.findOne.mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: mockPostId });
      expect(mockPost.toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Post retrieved successfully',
          post: expect.objectContaining({ 
            _id: mockPostId,
            title: 'Test Post',
            status: 'Published',
          }),
        })
      );
    });

    it('should require auth for unpublished post', async () => {
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockPost = { 
        _id: mockPostId,
        status: 'Pending Approval',
      };
      Post.findOne.mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: mockPostId });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required to view unpublished post',
        })
      );
    });

    it('should allow owner to view unpublished post', async () => {
      req.headers.authorization = 'Bearer validtoken';
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockUserId = '507f191e810c19729de860ea';
      const mockPost = {
        _id: mockPostId,
        status: 'Pending Approval',
        userID: mockUserId,
        toObject: jest.fn(() => ({
          _id: mockPostId,
          status: 'Pending Approval',
          // userID deleted
        })),
      };
      jwt.verify.mockReturnValue({ id: mockUserId, role: 'member' });
      Post.findOne.mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockPost.toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Post retrieved successfully',
          post: expect.objectContaining({ status: 'Pending Approval' }),
        })
      );
    });

    it('should allow admin to view unpublished post', async () => {
      req.headers.authorization = 'Bearer admintoken';
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockUserId = '507f191e810c19729de860eb'; // Different user
      const mockPost = {
        _id: mockPostId,
        status: 'Pending Approval',
        userID: mockUserId,
        toObject: jest.fn(() => ({
          _id: mockPostId,
          status: 'Pending Approval',
        })),
      };
      jwt.verify.mockReturnValue({ id: 'admin1', role: 'admin' });
      Post.findOne.mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(mockPost.toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Post retrieved successfully',
        })
      );
    });

    it('should deny non-owner access to unpublished post', async () => {
      req.headers.authorization = 'Bearer usertoken';
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockOwnerId = '507f191e810c19729de860ea';
      const mockPost = { 
        _id: mockPostId,
        status: 'Pending Approval', 
        userID: mockOwnerId
      };
      jwt.verify.mockReturnValue({ id: 'user2', role: 'member' });
      Post.findOne.mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized to view this post',
        })
      );
    });

    it('should handle invalid ID format', async () => {
      req.params.id = 'invalidid';

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid post ID format',
        })
      );
    });

    it('should handle post not found', async () => {
      Post.findOne.mockResolvedValue(null);

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Post not found',
        })
      );
    });

    it('should handle invalid token', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token',
        })
      );
    });

    it('should handle server error', async () => {
      Post.findOne.mockRejectedValue(new Error('DB error'));

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error during fetching post',
        })
      );
    });
  });

  describe('getSimilarPosts', () => {
    it('should return similar posts for published post', async () => {
      const mockPostId = '507f1f77bcf86cd799439011';
      const mockCurrentPost = { category: 'food' };
      const mockSimilar = [
        { _id: '507f1f77bcf86cd799439012', title: 'Similar Food Post', category: 'food', status: 'Published' },
      ];

      // --- MOCKING THE Post.findOne CHAIN (Current Post Category) ---
      const mockFindOneLean = jest.fn(() => Promise.resolve(mockCurrentPost));
      const mockFindOneSelect = {
        lean: mockFindOneLean
      };
      Post.findOne.mockReturnValue({
        select: jest.fn(() => mockFindOneSelect)
      });


      // --- MOCKING THE Post.find CHAIN (Similar Posts) ---
      const mockFindLean = jest.fn(() => Promise.resolve(mockSimilar));
      const mockFindSelect = {
        lean: mockFindLean
      };
      const mockFindLimit = {
        select: jest.fn(() => mockFindSelect)
      };
      const mockFindSort = {
        limit: jest.fn(() => mockFindLimit)
      };
      // Post.find must return the object that has the .sort method
      Post.find.mockReturnValue({
        sort: jest.fn(() => mockFindSort)
      });
      
      // Assign the spies for assertion
      const findSortSpy = Post.find().sort;
      const findLimitSpy = mockFindSort.limit;
      const findSelectSpy = mockFindLimit.select;


      await getSimilarPosts(req, res);

      // 1. Assert Post.findOne (for current post category)
      expect(Post.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockPostId, status: 'Published' })
      );
      expect(Post.findOne().select).toHaveBeenCalledWith('category');
      expect(mockFindOneLean).toHaveBeenCalled();
      
      // 2. Assert Post.find (for similar posts)
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'food',
          _id: { $ne: mockPostId },
          status: 'Published',
        })
      );

      // 3. Assert the chained methods using the spies defined above
      expect(findSortSpy).toHaveBeenCalledWith({ createdAt: -1 });
      expect(findLimitSpy).toHaveBeenCalledWith(5);
      expect(findSelectSpy).toHaveBeenCalledWith('-userID');
      expect(mockFindLean).toHaveBeenCalled();

      // 4. Assert response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Similar posts retrieved successfully',
          similarPosts: mockSimilar,
        })
      );
    });

    it('should return 404 if current post not found or unpublished', async () => {
      // Mock Post.findOne to return a chain that resolves to null
      const mockFindOneLean = jest.fn(() => Promise.resolve(null));
      const mockFindOneSelect = {
        lean: mockFindOneLean
      };
      Post.findOne.mockReturnValue({
        select: jest.fn(() => mockFindOneSelect)
      });

      // We still need to mock Post.find to prevent an undefined error, 
      // even though it shouldn't be reached.
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
      });


      await getSimilarPosts(req, res);

      expect(Post.findOne().select).toHaveBeenCalledWith('category');
      expect(mockFindOneLean).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Post not found or not published',
        })
      );
    });

    it('should handle invalid ID format', async () => {
      req.params.id = 'invalidid';

      await getSimilarPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid post ID format',
        })
      );
    });

    it('should handle server error', async () => {
      Post.findOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await getSimilarPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error during fetching similar posts',
        })
      );
    });
  });
});
