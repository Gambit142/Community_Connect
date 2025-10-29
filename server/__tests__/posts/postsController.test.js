const { getPosts } = require('../../src/controllers/posts/postsController.js');
const Post = require('../../src/models/Post.js');

jest.mock('../../src/models/Post.js');

describe('Posts Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console errors
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getPosts', () => {
    // Helper to mock the full Mongoose chain
    const mockMongooseChain = (mockPosts) => {
      const mockLean = Promise.resolve(mockPosts);
      const mockSelect = {
        lean: jest.fn(() => mockLean),
      };
      const mockLimit = {
        select: jest.fn(() => mockSelect),
      };
      const mockSkip = {
        limit: jest.fn(() => mockLimit),
      };
      const mockSort = {
        skip: jest.fn(() => mockSkip),
      };
      const mockQuery = {
        sort: jest.fn(() => mockSort),
      };
      Post.find.mockReturnValue(mockQuery);
      return { mockQuery, mockSort, mockSkip, mockLimit, mockSelect, mockLean };
    };

    it('should validate query params and return posts successfully', async () => {
      const mockPosts = [
        { _id: '1', title: 'Test Post', status: 'Published', createdAt: new Date() },
      ];
      const mockCount = 1;

      mockMongooseChain(mockPosts);
      Post.countDocuments.mockResolvedValue(mockCount);

      await getPosts(req, res);

      // FIX: Post.find in the controller is called with one argument (the query object)
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published' })
      );
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Post.find().sort().skip).toHaveBeenCalledWith(0);
      expect(Post.find().sort().skip().limit).toHaveBeenCalledWith(6);
      expect(Post.find().sort().skip().limit().select).toHaveBeenCalledWith('-userID');
      
      expect(Post.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Posts retrieved successfully',
          posts: mockPosts,
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 1,
            totalPosts: 1,
            hasNext: false,
          }),
        })
      );
    });

    it('should filter by category', async () => {
      req.query = { category: 'food' };
      const mockPosts = [{ _id: '1', category: 'food', status: 'Published' }];
      
      mockMongooseChain(mockPosts);
      Post.countDocuments.mockResolvedValue(1);

      await getPosts(req, res);

      // FIX: Only check the first argument, which is the query object.
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published', category: 'food' })
      );
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Post.find().sort().skip).toHaveBeenCalledWith(0);
      expect(Post.find().sort().skip().limit).toHaveBeenCalledWith(6);
      expect(Post.find().sort().skip().limit().select).toHaveBeenCalledWith('-userID');
    });

    it('should search across title, description, location', async () => {
      req.query = { search: 'test' };
      const mockPosts = [{ _id: '1', title: 'Test Post', status: 'Published' }];
      
      mockMongooseChain(mockPosts);
      Post.countDocuments.mockResolvedValue(1);

      await getPosts(req, res);

      // FIX: Only check the first argument, which is the query object.
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Published',
          $or: [
            { title: { $regex: 'test', $options: 'i' } },
            { description: { $regex: 'test', $options: 'i' } },
            { location: { $regex: 'test', $options: 'i' } },
          ],
        })
      );
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Post.find().sort().skip).toHaveBeenCalledWith(0);
      expect(Post.find().sort().skip().limit).toHaveBeenCalledWith(6);
      expect(Post.find().sort().skip().limit().select).toHaveBeenCalledWith('-userID');
    });

    it('should filter by tags (all match)', async () => {
      req.query = { tags: 'free,urgent' };
      const mockPosts = [{ _id: '1', tags: ['free', 'urgent'], status: 'Published' }];
      
      mockMongooseChain(mockPosts);
      Post.countDocuments.mockResolvedValue(1);

      await getPosts(req, res);

      // FIX: Only check the first argument, which is the query object.
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Published',
          tags: { $all: ['free', 'urgent'] },
        })
      );
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Post.find().sort().skip).toHaveBeenCalledWith(0);
      expect(Post.find().sort().skip().limit).toHaveBeenCalledWith(6);
      expect(Post.find().sort().skip().limit().select).toHaveBeenCalledWith('-userID');
    });

    it('should handle pagination', async () => {
      req.query = { page: '2', limit: '3' };
      const mockPosts = [
        { _id: '1' }, { _id: '2' }, { _id: '3' }
      ];
      
      mockMongooseChain(mockPosts);
      Post.countDocuments.mockResolvedValue(6); // Total 6 posts for two pages

      await getPosts(req, res);

      // FIX: Only check the first argument, which is the query object.
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published' })
      );
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Post.find().sort().skip).toHaveBeenCalledWith(3); // (2-1) * 3 = 3
      expect(Post.find().sort().skip().limit).toHaveBeenCalledWith(3); // limit 3
      expect(Post.find().sort().skip().limit().select).toHaveBeenCalledWith('-userID');
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            currentPage: 2,
            totalPages: 2,
            totalPosts: 6,
            hasNext: false, // Page 2 of 2, so no next
          }),
        })
      );
    });

    it('should validate invalid query params', async () => {
      req.query = { limit: 'abc' };

      await getPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('"limit" must be a number'),
        })
      );
    });

    it('should handle server error', async () => {
      Post.find.mockImplementation(() => {
        throw new Error('DB error');
      });
      Post.countDocuments.mockRejectedValue(new Error('DB count error'));

      await getPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error during fetching posts',
        })
      );
    });
  });
});
