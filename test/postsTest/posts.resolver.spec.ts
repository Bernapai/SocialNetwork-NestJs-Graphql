import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { PostsResolver } from 'src/posts/resolvers/posts.resolver';
import { PostsService } from 'src/posts/services/posts.service';
import { CreatePostInput } from 'src/posts/dto/create-post.input';
import { UpdatePostInput } from 'src/posts/dto/update-post.input';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

describe('PostsResolver', () => {
  let resolver: PostsResolver;
  let postsService: PostsService;

  const mockAuthorId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockPostId = new Types.ObjectId('507f1f77bcf86cd799439012');
  const mockOtherUserId = new Types.ObjectId('507f1f77bcf86cd799439013');

  const mockPost: Post = {
    _id: mockPostId,
    content: 'This is a test post content',
    images: ['image1.jpg', 'image2.jpg'],
    authorId: mockAuthorId,
    author: {} as User, // Mock virtual field
    likesCount: 5,
    commentsCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCurrentUser: User = {
    _id: mockAuthorId,
    email: 'author@example.com',
    username: 'author',
    password: 'hashedpassword',
    firstName: 'Author',
    lastName: 'User',
    avatar: 'author-avatar.jpg',
    bio: 'Author bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOtherUser: User = {
    _id: mockOtherUserId,
    email: 'other@example.com',
    username: 'otheruser',
    password: 'hashedpassword',
    firstName: 'Other',
    lastName: 'User',
    avatar: 'other-avatar.jpg',
    bio: 'Other user bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
    postsService = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostInput: CreatePostInput = {
        content: 'This is a test post content',
        images: ['image1.jpg', 'image2.jpg'],
      };

      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await resolver.createPost(createPostInput);

      expect(postsService.create).toHaveBeenCalledWith(createPostInput);
      expect(result).toEqual(mockPost);
    });

    it('should create a post without images', async () => {
      const createPostInput: CreatePostInput = {
        content: 'This is a test post without images',
      };

      const postWithoutImages = { ...mockPost, images: [] };
      mockPostsService.create.mockResolvedValue(postWithoutImages);

      const result = await resolver.createPost(createPostInput);

      expect(postsService.create).toHaveBeenCalledWith(createPostInput);
      expect(result).toEqual(postWithoutImages);
    });

    it('should handle service errors', async () => {
      const createPostInput: CreatePostInput = {
        content: 'This is a test post content',
      };

      const error = new Error('Database error');
      mockPostsService.create.mockRejectedValue(error);

      await expect(resolver.createPost(createPostInput)).rejects.toThrow(error);
      expect(postsService.create).toHaveBeenCalledWith(createPostInput);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostsService.findAll.mockResolvedValue(posts);

      const result = await resolver.findAll();

      expect(postsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });

    it('should return empty array when no posts exist', async () => {
      mockPostsService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(postsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const postId = '507f1f77bcf86cd799439012';

    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await resolver.findOne(postId);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });

    it('should handle post not found', async () => {
      const error = new Error('Post not found');
      mockPostsService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne(postId)).rejects.toThrow(error);
      expect(postsService.findOne).toHaveBeenCalledWith(postId);
    });
  });

  describe('updatePost', () => {
    const postId = '507f1f77bcf86cd799439012';
    const updatePostInput: UpdatePostInput = {
      content: 'Updated post content',
      images: ['updated-image.jpg'],
    };

    it('should update post when user is the author', async () => {
      const updatedPost = { ...mockPost, ...updatePostInput };

      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(mockCurrentUser, postId, updatePostInput);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.update).toHaveBeenCalledWith(postId, updatePostInput);
      expect(result).toEqual(updatedPost);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      await expect(
        resolver.updatePost(mockOtherUser, postId, updatePostInput)
      ).rejects.toThrow(ForbiddenException);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.update).not.toHaveBeenCalled();
    });

    it('should handle post not found during ownership check', async () => {
      const error = new Error('Post not found');
      mockPostsService.findOne.mockRejectedValue(error);

      await expect(
        resolver.updatePost(mockCurrentUser, postId, updatePostInput)
      ).rejects.toThrow(error);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.update).not.toHaveBeenCalled();
    });

    it('should update only content', async () => {
      const updateInput: UpdatePostInput = {
        content: 'Only content updated',
      };

      const updatedPost = { ...mockPost, content: updateInput.content };

      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(mockCurrentUser, postId, updateInput);

      expect(postsService.update).toHaveBeenCalledWith(postId, updateInput);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('removePost', () => {
    const postId = '507f1f77bcf86cd799439012';

    it('should remove post when user is the author', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await resolver.removePost(mockCurrentUser, postId);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      await expect(
        resolver.removePost(mockOtherUser, postId)
      ).rejects.toThrow(ForbiddenException);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.remove).not.toHaveBeenCalled();
    });

    it('should handle post not found during ownership check', async () => {
      const error = new Error('Post not found');
      mockPostsService.findOne.mockRejectedValue(error);

      await expect(
        resolver.removePost(mockCurrentUser, postId)
      ).rejects.toThrow(error);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.remove).not.toHaveBeenCalled();
    });

    it('should handle remove service error', async () => {
      const removeError = new Error('Database error during removal');

      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.remove.mockRejectedValue(removeError);

      await expect(
        resolver.removePost(mockCurrentUser, postId)
      ).rejects.toThrow(removeError);

      expect(postsService.findOne).toHaveBeenCalledWith(postId);
      expect(postsService.remove).toHaveBeenCalledWith(postId);
    });
  });

  describe('authorization edge cases', () => {
    const postId = '507f1f77bcf86cd799439012';

    it('should handle string comparison for ObjectIds in updatePost', async () => {
      // Test when ObjectIds are compared as strings
      const postWithStringAuthorId = {
        ...mockPost,
        authorId: {
          toString: () => mockAuthorId.toString(),
        } as Types.ObjectId,
      };

      const updateInput: UpdatePostInput = { content: 'Updated' };
      const updatedPost = { ...postWithStringAuthorId, ...updateInput };

      mockPostsService.findOne.mockResolvedValue(postWithStringAuthorId);
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(mockCurrentUser, postId, updateInput);

      expect(result).toEqual(updatedPost);
    });

    it('should handle string comparison for ObjectIds in removePost', async () => {
      // Test when ObjectIds are compared as strings
      const postWithStringAuthorId = {
        ...mockPost,
        authorId: {
          toString: () => mockAuthorId.toString(),
        } as Types.ObjectId,
      };

      mockPostsService.findOne.mockResolvedValue(postWithStringAuthorId);
      mockPostsService.remove.mockResolvedValue(postWithStringAuthorId);

      const result = await resolver.removePost(mockCurrentUser, postId);

      expect(result).toEqual(postWithStringAuthorId);
    });
  });
});