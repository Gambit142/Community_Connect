const { getMyPosts } = require('../../src/controllers/posts/getMyPostsController.js');
const Post = require('../../src/models/Post.js');

jest.mock('../../src/models/Post.js');

describe('Get My Posts Controller', () => {
  let req, res;
  const mockUserId = '607f1f77bcf86cd799439011';

  // Helper to mock the full Mongoose chain for find
  const mockMongooseChain = (mockPosts) => {
    const mockLean = jest.fn(() => Promise.resolve(mockPosts));
    const mockLimit = { lean: mockLean };
    
    // Define the mocks for the chain steps
    const mockLimitSpy = jest.fn(() => mockLimit);
    const mockSkipSpy = jest.fn(() => ({ limit: mockLimitSpy }));
    const mockSortSpy = jest.fn(() => ({ skip: mockSkipSpy }));

    // The initial Post.find call returns the object containing the .sort method
    const mockQuery = {
      sort: mockSortSpy
    };
    
    Post.find.mockReturnValue(mockQuery);

    // Return the spies for assertion
    return { 
      mockSort: mockQuery, 
      mockSkip: { skip: mockSkipSpy }, 
      mockLimit: { limit: mockLimitSpy } 
    };
  };

  beforeEach(() => {
    req = {
      user: { _id: mockUserId },
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

  it('should return user posts with default pagination and filter (all statuses)', async () => {
    const mockPosts = [
      { _id: '1', title: 'Post 1', userID: mockUserId, status: 'Published' },
    ];
    const mockCount = 1;

    // Use the helper to set up the mock chain and get references to spies
    const { mockSort, mockSkip, mockLimit } = mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(mockCount);

    await getMyPosts(req, res);

    // 1. Check Query
    expect(Post.find).toHaveBeenCalledWith({ userID: mockUserId });

    // 2. Check Chain - Use the actual spies from the mock structure
    expect(mockSort.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockSkip.skip).toHaveBeenCalledWith(0);
    expect(mockLimit.limit).toHaveBeenCalledWith(10);
    expect(Post.countDocuments).toHaveBeenCalledWith({ userID: mockUserId });

    // 3. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Your posts retrieved successfully',
        posts: mockPosts,
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: 1,
          totalPosts: 1,
        }),
      })
    );
  });

  it('should filter by specific status', async () => {
    req.query = { status: 'Pending Approval' };
    const mockPosts = [{ _id: '1', status: 'Pending Approval', userID: mockUserId }];
    
    mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(1);

    await getMyPosts(req, res);

    // Check Query
    expect(Post.find).toHaveBeenCalledWith({ userID: mockUserId, status: 'Pending Approval' });
    expect(Post.countDocuments).toHaveBeenCalledWith({ userID: mockUserId, status: 'Pending Approval' });
  });

  it('should handle custom pagination', async () => {
    req.query = { page: '2', limit: '5' };
    const mockPosts = [];
    const mockCount = 12; // 3 pages needed (5, 5, 2)

    const { mockSkip, mockLimit } = mockMongooseChain(mockPosts);
    Post.countDocuments.mockResolvedValue(mockCount);

    await getMyPosts(req, res);

    // Check pagination calculations - use the correct spies
    expect(mockSkip.skip).toHaveBeenCalledWith(5); // (2-1) * 5 = 5
    expect(mockLimit.limit).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          currentPage: 2,
          totalPages: 3,
          totalPosts: 12,
          hasNext: true,
        }),
      })
    );
  });

  it('should return 400 for invalid query parameters', async () => {
    req.query = { page: 'zero' };

    await getMyPosts(req, res);

    expect(Post.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('"page" must be a number'),
      })
    );
  });

  it('should handle server error', async () => {
    Post.find.mockImplementation(() => {
      throw new Error('DB error');
    });

    await getMyPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during fetching your posts',
      })
    );
  });
});
