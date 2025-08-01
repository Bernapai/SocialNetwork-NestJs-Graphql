import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { LikesResolver } from 'src/likes/resolvers/likes.resolver';
import { LikesService } from 'src/likes/services/likes.service';
import { CreateLikeInput } from 'src/likes/dto/create-like.input';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

describe('LikesResolver', () => {
  let resolver: LikesResolver;
  let likesService: LikesService;

  const mockUserId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockPostId = new Types.ObjectId('507f1f77bcf86cd799439012');
  const mockLikeId = new Types.ObjectId('507f1f77bcf86cd799439013');
  const mockOtherUserId = new Types.ObjectId('507f1f77bcf86cd799439014');

  const mockUser: User = {
    _id: mockUserId,
    email: 'user@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    avatar: 'avatar.jpg',
    bio: 'Test bio',
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

  const mockPost: Post = {
    _id: mockPostId,
    content: 'Test post content',
    images: ['image.jpg'],
    authorId: mockUserId,
    author: mockUser,
    likesCount: 1,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLike: Like = {
    _id: mockLikeId,
    userId: mockUserId,
    postId: mockPostId,
    user: mockUser,
    post: mockPost,
    createdAt: new Date(),
  };

  const mockLikesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesResolver,
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
      ],
    }).compile();

    resolver = module.get<LikesResolver>(LikesResolver);
    likesService = module.get<LikesService>(LikesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createLike', () => {
    it('should create a new like', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      mockLikesService.create.mockResolvedValue(mockLike);

      const result = await resolver.createLike(createLikeInput);

      expect(likesService.create).toHaveBeenCalledWith(createLikeInput);
      expect(result).toEqual(mockLike);
    });

    it('should handle service errors during creation', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      const error = new Error('Post not found');
      mockLikesService.create.mockRejectedValue(error);

      await expect(resolver.createLike(createLikeInput)).rejects.toThrow(error);
      expect(likesService.create).toHaveBeenCalledWith(createLikeInput);
    });

    it('should handle duplicate like creation', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      const duplicateError = new Error('User already liked this post');
      mockLikesService.create.mockRejectedValue(duplicateError);

      await expect(resolver.createLike(createLikeInput)).rejects.toThrow(duplicateError);
      expect(likesService.create).toHaveBeenCalledWith(createLikeInput);
    });

    it('should handle invalid postId format', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: 'invalid-post-id',
      };

      const validationError = new Error('Invalid ObjectId format');
      mockLikesService.create.mockRejectedValue(validationError);

      await expect(resolver.createLike(createLikeInput)).rejects.toThrow(validationError);
    });
  });

  describe('findAll', () => {
    it('should return all likes', async () => {
      const likes = [mockLike];
      mockLikesService.findAll.mockResolvedValue(likes);

      const result = await resolver.findAll();

      expect(likesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(likes);
    });

    it('should return empty array when no likes exist', async () => {
      mockLikesService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(likesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockLikesService.findAll.mockRejectedValue(error);

      await expect(resolver.findAll()).rejects.toThrow(error);
      expect(likesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const likeId = '507f1f77bcf86cd799439013';

    it('should return a like by id', async () => {
      mockLikesService.findOne.mockResolvedValue(mockLike);

      const result = await resolver.findOne(likeId);

      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
      expect(result).toEqual(mockLike);
    });

    it('should handle like not found', async () => {
      const error = new Error('Like not found');
      mockLikesService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne(likeId)).rejects.toThrow(error);
      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
    });

    it('should handle invalid like id format', async () => {
      const invalidId = 'invalid-like-id';
      const error = new Error('Cast to ObjectId failed');
      mockLikesService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne(invalidId)).rejects.toThrow(error);
      expect(likesService.findOne).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('removeLike', () => {
    const likeId = '507f1f77bcf86cd799439013';

    it('should remove like when user is the owner', async () => {
      mockLikesService.findOne.mockResolvedValue(mockLike);
      mockLikesService.remove.mockResolvedValue(mockLike);

      const result = await resolver.removeLike(mockUser, likeId);

      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
      expect(likesService.remove).toHaveBeenCalledWith(likeId);
      expect(result).toEqual(mockLike);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockLikesService.findOne.mockResolvedValue(mockLike);

      await expect(resolver.removeLike(mockOtherUser, likeId)).rejects.toThrow(ForbiddenException);

      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
      expect(likesService.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException with correct message', async () => {
      mockLikesService.findOne.mockResolvedValue(mockLike);

      await expect(resolver.removeLike(mockOtherUser, likeId)).rejects.toThrow(
        'Solo puedes eliminar tus propios likes'
      );
    });

    it('should handle like not found during ownership check', async () => {
      const error = new Error('Like not found');
      mockLikesService.findOne.mockRejectedValue(error);

      await expect(resolver.removeLike(mockUser, likeId)).rejects.toThrow(error);

      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
      expect(likesService.remove).not.toHaveBeenCalled();
    });

    it('should handle removal service error', async () => {
      const removeError = new Error('Database error during removal');

      mockLikesService.findOne.mockResolvedValue(mockLike);
      mockLikesService.remove.mockRejectedValue(removeError);

      await expect(resolver.removeLike(mockUser, likeId)).rejects.toThrow(removeError);

      expect(likesService.findOne).toHaveBeenCalledWith(likeId);
      expect(likesService.remove).toHaveBeenCalledWith(likeId);
    });

    it('should handle string comparison for ObjectIds', async () => {
      // Test when ObjectIds are compared as strings
      const likeWithStringUserId = {
        ...mockLike,
        userId: {
          toString: () => mockUserId.toString(),
        } as Types.ObjectId,
      };

      mockLikesService.findOne.mockResolvedValue(likeWithStringUserId);
      mockLikesService.remove.mockResolvedValue(likeWithStringUserId);

      const result = await resolver.removeLike(mockUser, likeId);

      expect(result).toEqual(likeWithStringUserId);
      expect(likesService.remove).toHaveBeenCalledWith(likeId);
    });
  });

  describe('authorization edge cases', () => {
    const likeId = '507f1f77bcf86cd799439013';

    it('should handle null user in authorization check', async () => {
      mockLikesService.findOne.mockResolvedValue(mockLike);

      const nullUser = null as any;

      await expect(resolver.removeLike(nullUser, likeId)).rejects.toThrow();
      expect(likesService.remove).not.toHaveBeenCalled();
    });

    it('should handle undefined userId in like', async () => {
      const likeWithoutUserId = { ...mockLike, userId: undefined };
      mockLikesService.findOne.mockResolvedValue(likeWithoutUserId);

      await expect(resolver.removeLike(mockUser, likeId)).rejects.toThrow();
      expect(likesService.remove).not.toHaveBeenCalled();
    });

    it('should properly compare different ObjectId formats', async () => {
      // Test with different ObjectId representations
      const differentFormatLike = {
        ...mockLike,
        userId: new Types.ObjectId(mockUserId.toString()),
      };

      mockLikesService.findOne.mockResolvedValue(differentFormatLike);
      mockLikesService.remove.mockResolvedValue(differentFormatLike);

      const result = await resolver.removeLike(mockUser, likeId);

      expect(result).toEqual(differentFormatLike);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid like creation and removal', async () => {
      const createInput: CreateLikeInput = { postId: mockPostId.toString() };
      const likeId = mockLikeId.toString();

      // First create a like
      mockLikesService.create.mockResolvedValue(mockLike);
      const createdLike = await resolver.createLike(createInput);

      // Then remove it
      mockLikesService.findOne.mockResolvedValue(mockLike);
      mockLikesService.remove.mockResolvedValue(mockLike);
      const removedLike = await resolver.removeLike(mockUser, likeId);

      expect(createdLike).toEqual(mockLike);
      expect(removedLike).toEqual(mockLike);
    });

    it('should handle concurrent like operations', async () => {
      const createInput: CreateLikeInput = { postId: mockPostId.toString() };

      // Simulate concurrent operations
      const concurrentError = new Error('Concurrent modification detected');
      mockLikesService.create.mockRejectedValue(concurrentError);

      await expect(resolver.createLike(createInput)).rejects.toThrow(concurrentError);
    });
  });
});