import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from 'src/posts/services/posts.service';
import { Post, PostDocument } from 'src/posts/entities/post.entity';
import { CreatePostInput } from 'src/posts/dto/create-post.input';
import { UpdatePostInput } from 'src/posts/dto/update-post.input';

describe('PostsService', () => {
  let service: PostsService;
  let model: Model<PostDocument>;

  const mockAuthorId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockPostId = new Types.ObjectId('507f1f77bcf86cd799439012');

  const mockPost = {
    _id: mockPostId,
    content: 'This is a test post content',
    images: ['image1.jpg', 'image2.jpg'],
    authorId: mockAuthorId,
    likesCount: 5,
    commentsCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPostModel = {
    new: jest.fn().mockResolvedValue(mockPost),
    constructor: jest.fn().mockResolvedValue(mockPost),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    model = module.get<Model<PostDocument>>(getModelToken(Post.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostInput: CreatePostInput = {
        content: 'This is a test post content',
        images: ['image1.jpg', 'image2.jpg'],
      };

      const saveMock = jest.fn().mockResolvedValue(mockPost);
      const constructorMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: saveMock,
      }));

      // Create a mock instance
      const mockInstance = {
        save: saveMock,
      };
      jest.spyOn(service['postModel'], 'constructor' as any).mockReturnValue(mockInstance);

      const result = await service.create(createPostInput);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it('should create a post without images', async () => {
      const createPostInput: CreatePostInput = {
        content: 'This is a test post without images',
      };

      const postWithoutImages = { ...mockPost, images: [] };
      const saveMock = jest.fn().mockResolvedValue(postWithoutImages);

      const mockInstance = {
        save: saveMock,
      };
      jest.spyOn(service['postModel'], 'constructor' as any).mockReturnValue(mockInstance);

      const result = await service.create(createPostInput);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(postWithoutImages);
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const posts = [mockPost];

      mockPostModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(posts),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });

    it('should return empty array when no posts exist', async () => {
      mockPostModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const postId = '507f1f77bcf86cd799439012';

    it('should return a post by id', async () => {
      mockPostModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPost),
      });

      const result = await service.findOne(postId);

      expect(model.findById).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(postId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(postId);
    });
  });

  describe('update', () => {
    const postId = '507f1f77bcf86cd799439012';
    const updatePostInput: UpdatePostInput = {
      content: 'Updated post content',
      images: ['updated-image.jpg'],
    };

    it('should update and return the post', async () => {
      const updatedPost = { ...mockPost, ...updatePostInput };

      mockPostModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPost),
      });

      const result = await service.update(postId, updatePostInput);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        updatePostInput,
        { new: true }
      );
      expect(result).toEqual(updatedPost);
    });

    it('should update only content', async () => {
      const updateInput: UpdatePostInput = {
        content: 'Only content updated',
      };

      const updatedPost = { ...mockPost, content: updateInput.content };

      mockPostModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPost),
      });

      const result = await service.update(postId, updateInput);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        updateInput,
        { new: true }
      );
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(postId, updatePostInput)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    const postId = '507f1f77bcf86cd799439012';

    it('should delete and return the post', async () => {
      mockPostModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPost),
      });

      const result = await service.remove(postId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(postId)).rejects.toThrow(NotFoundException);
    });
  });
});