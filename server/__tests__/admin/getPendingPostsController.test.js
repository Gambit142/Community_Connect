const { getPendingPosts } = require('../../src/controllers/admin/getPendingPostsController.js');
const Post = require('../../src/models/Post.js');

jest.mock('../../src/models/Post.js');

describe('Get Pending Posts Controller', () => {
  let req, res;

  /**
   * Helper to correctly mock the full Mongoose chain for find with populate.
   * Ensures that each method in the chain is a callable spy.
   */
  const mockMongooseChain = (mockPosts) => {
    // 1. Final mock that resolves the promise
    const mockLean = jest.fn(() => Promise.resolve(mockPosts));

    // 2. Mocking the chain steps backwards, linking each spy to the next object
    const mockLimitSpy = jest.fn(() => ({ lean: mockLean }));
    const mockSkipSpy = jest.fn(() => ({ limit: mockLimitSpy }));
    const mockSortSpy = jest.fn(() => ({ skip: mockSkipSpy }));
    const mockPopulateSpy = jest.fn(() => ({ sort: mockSortSpy }));

    // 3. The initial Post.find call returns the object containing the .populate method
    const mockQuery = {
      populate: mockPopulateSpy
    };
    Post.find.mockReturnValue(mockQuery);

    // 4. Return the specific spy functions/objects needed for assertion
    return { 
      mockPopulate: mockQuery, // Object containing the populate method, used to call the spy
      mockSort: { sort: mockSortSpy }, 
      mockSkip: { skip: mockSkipSpy }, 
      mockLimit: { limit: mockLimitSpy },
      mockLean 
    };
  };

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should return a list of pending posts with default pagination and sorting', async () => {
    const mockPosts = [
      { _id: '1', title: 'Pending 1', status: 'Pending Approval', userID: { username: 'user1' } },
    ];
    const mockCount = 1;

    const { mockPopulate, mockSort, mockSkip, mockLimit, mockLean } = mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(mockCount);

    await getPendingPosts(req, res);

    // 1. Check Query
    expect(Post.find).toHaveBeenCalledWith({ status: 'Pending Approval' });

    // 2. Check Chain (Assert against the exposed spies)
    expect(mockPopulate.populate).toHaveBeenCalledWith('userID', 'username email');
    expect(mockSort.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockSkip.skip).toHaveBeenCalledWith(0);
    expect(mockLimit.limit).toHaveBeenCalledWith(10);
    expect(mockLean).toHaveBeenCalled();
    expect(Post.countDocuments).toHaveBeenCalledWith({ status: 'Pending Approval' });

    // 3. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Pending posts retrieved successfully',
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

  it('should filter by search query (title/description)', async () => {
    req.query = { search: 'urgent' };
    const mockPosts = [{ _id: '1', title: 'Urgent Request', status: 'Pending Approval' }];

    mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(1);

    await getPendingPosts(req, res);

    // Check Query with $or
    expect(Post.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Pending Approval',
        $or: [
          { title: { $regex: 'urgent', $options: 'i' } },
          { description: { $regex: 'urgent', $options: 'i' } },
        ],
      })
    );
  });

  it('should handle custom pagination', async () => {
    req.query = { page: '3', limit: '5' };
    
    // FIX: Set mockPosts to contain the remaining 3 items (13 total - 10 skipped)
    const mockPosts = [
      { _id: '11', title: 'Post 11', status: 'Pending Approval' },
      { _id: '12', title: 'Post 12', status: 'Pending Approval' },
      { _id: '13', title: 'Post 13', status: 'Pending Approval' },
    ];
    const mockCount = 13; 

    const { mockSkip, mockLimit } = mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(mockCount);

    await getPendingPosts(req, res);

    // Check pagination calculations
    expect(mockSkip.skip).toHaveBeenCalledWith(10); // (3-1) * 5 = 10
    expect(mockLimit.limit).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          currentPage: 3,
          totalPages: 3,
          totalPosts: 13,
          hasNext: false, // Now correctly asserts false because 10 (skip) + 3 (posts.length) is NOT < 13
        }),
      })
    );
  });

  it('should return 400 for invalid query parameters', async () => {
    req.query = { limit: 'fifty' };

    await getPendingPosts(req, res);

    expect(Post.find).not.toHaveBeenCalled();
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

    await getPendingPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during fetching pending posts',
      })
    );
  });
});
