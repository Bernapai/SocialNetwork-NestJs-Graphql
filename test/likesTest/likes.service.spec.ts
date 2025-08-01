import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { LikesService } from 'src/likes/services/likes.service';
import { Like, LikeDocument } from 'src/likes/entities/like.entity';
import { CreateLikeInput } from 'src/likes/dto/create-like.input';

describe('LikesService', () => {
  let service: LikesService;
  let model: Model<LikeDocument>;

  const mockUserId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockPostId = new Types.ObjectId('507f1f77bcf86cd799439012');
  const mockLikeId = new Types.ObjectId('507f1f77bcf86cd799439013');

  const mockLike = {
    _id: mockLikeId,
    userId: mockUserId,
    postId: mockPostId,
    user: {}, // Virtual field
    post: {}, // Virtual field
    createdAt: new Date(),
  };

  const mockLikeModel = {
    new: jest.fn().mockResolvedValue(mockLike),
    constructor: jest.fn().mockResolvedValue(mockLike),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: getModelToken(Like.name),
          useValue: mockLikeModel,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    model = module.get<Model<LikeDocument>>(getModelToken(Like.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new like', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      const saveMock = jest.fn().mockResolvedValue(mockLike);
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
      jest.spyOn(service['likeModel'], 'constructor' as any).mockReturnValue(mockInstance);

      const result = await service.create(createLikeInput);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockLike);
    });

    it('should handle database errors during creation', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      const error = new Error('Database connection error');
      const saveMock = jest.fn().mockRejectedValue(error);

      const mockInstance = {
        save: saveMock,
      };
      jest.spyOn(service['likeModel'], 'constructor' as any).mockReturnValue(mockInstance);

      await expect(service.create(createLikeInput)).rejects.toThrow(error);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of likes', async () => {
      const likes = [mockLike];

      mockLikeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(likes),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(likes);
    });

    it('should return empty array when no likes exist', async () => {
      mockLikeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle database errors during findAll', async () => {
      const error = new Error('Database query error');

      mockLikeModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findAll()).rejects.toThrow(error);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const likeId = '507f1f77bcf86cd799439013';

    it('should return a like by id', async () => {
      mockLikeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLike),
      });

      const result = await service.findOne(likeId);

      expect(model.findById).toHaveBeenCalledWith(likeId);
      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException if like not found', async () => {
      mockLikeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(likeId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(likeId);
    });

    it('should throw NotFoundException with correct message', async () => {
      mockLikeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(likeId)).rejects.toThrow('Like not found');
    });

    it('should handle database errors during findOne', async () => {
      const error = new Error('Database connection lost');

      mockLikeModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findOne(likeId)).rejects.toThrow(error);
      expect(model.findById).toHaveBeenCalledWith(likeId);
    });
  });

  describe('remove', () => {
    const likeId = '507f1f77bcf86cd799439013';

    it('should delete and return the like', async () => {
      mockLikeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLike),
      });

      const result = await service.remove(likeId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(likeId);
      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException if like not found', async () => {
      mockLikeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(likeId)).rejects.toThrow(NotFoundException);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(likeId);
    });

    it('should throw NotFoundException with correct message', async () => {
      mockLikeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(likeId)).rejects.toThrow('Like not found');
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database transaction failed');

      mockLikeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.remove(likeId)).rejects.toThrow(error);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(likeId);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id';
      const error = new Error('Cast to ObjectId failed');

      mockLikeModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findOne(invalidId)).rejects.toThrow(error);
    });

    it('should handle concurrent like creation', async () => {
      const createLikeInput: CreateLikeInput = {
        postId: mockPostId.toString(),
      };

      // Simulate duplicate key error
      const duplicateError = new Error('E11000 duplicate key error');
      const saveMock = jest.fn().mockRejectedValue(duplicateError);

      const mockInstance = {
        save: saveMock,
      };
      jest.spyOn(service['likeModel'], 'constructor' as any).mockReturnValue(mockInstance);

      await expect(service.create(createLikeInput)).rejects.toThrow(duplicateError);
    });
  });
});