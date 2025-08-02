import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { FriendRequestService } from 'src/friend-request/services/friend-request.service';
import { FriendRequest, FriendRequestDocument, FriendRequestStatus } from 'src/friend-request/entities/friend-request.entity';
import { CreateFriendRequestInput } from 'src/friend-request/dto/create-friend-request.input';
import { UpdateFriendRequestInput } from 'src/friend-request/dto/update-friend-request.input';
import { Types } from 'mongoose';

describe('FriendRequestService', () => {
  let service: FriendRequestService;
  let model: Model<FriendRequestDocument>;

  const mockFriendRequest = {
    _id: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    receiverId: new Types.ObjectId(),
    status: FriendRequestStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFriendRequestModel = {
    new: jest.fn().mockResolvedValue(mockFriendRequest),
    constructor: jest.fn().mockResolvedValue(mockFriendRequest),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestService,
        {
          provide: getModelToken(FriendRequest.name),
          useValue: mockFriendRequestModel,
        },
      ],
    }).compile();

    service = module.get<FriendRequestService>(FriendRequestService);
    model = module.get<Model<FriendRequestDocument>>(getModelToken(FriendRequest.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a friend request', async () => {
      const createFriendRequestInput: CreateFriendRequestInput = {
        receiverId: mockFriendRequest.receiverId.toString(),
      };

      const saveSpy = jest.fn().mockResolvedValue(mockFriendRequest);
      jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: saveSpy,
      }));

      // Mock the model constructor to return an object with save method
      (model as any).mockImplementation(() => ({
        save: saveSpy,
      }));

      const result = await service.create(createFriendRequestInput);

      expect(result).toEqual(mockFriendRequest);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all friend requests', async () => {
      const friendRequests = [mockFriendRequest];
      mockFriendRequestModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(friendRequests),
      });

      const result = await service.findAll();

      expect(result).toEqual(friendRequests);
      expect(mockFriendRequestModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a friend request by id', async () => {
      const id = mockFriendRequest._id.toString();
      mockFriendRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFriendRequest),
      });

      const result = await service.findOne(id);

      expect(result).toEqual(mockFriendRequest);
      expect(mockFriendRequestModel.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if friend request not found', async () => {
      const id = 'non-existent-id';
      mockFriendRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockFriendRequestModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a friend request', async () => {
      const id = mockFriendRequest._id.toString();
      const updateInput: UpdateFriendRequestInput = {
        status: FriendRequestStatus.ACCEPTED,
      };
      const updatedFriendRequest = { ...mockFriendRequest, ...updateInput };

      mockFriendRequestModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedFriendRequest),
      });

      const result = await service.update(id, updateInput);

      expect(result).toEqual(updatedFriendRequest);
      expect(mockFriendRequestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateInput,
        { new: true }
      );
    });

    it('should throw NotFoundException if friend request not found', async () => {
      const id = 'non-existent-id';
      const updateInput: UpdateFriendRequestInput = {
        status: FriendRequestStatus.ACCEPTED,
      };

      mockFriendRequestModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, updateInput)).rejects.toThrow(NotFoundException);
      expect(mockFriendRequestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateInput,
        { new: true }
      );
    });
  });

  describe('remove', () => {
    it('should remove a friend request', async () => {
      const id = mockFriendRequest._id.toString();
      mockFriendRequestModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFriendRequest),
      });

      const result = await service.remove(id);

      expect(result).toEqual(mockFriendRequest);
      expect(mockFriendRequestModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if friend request not found', async () => {
      const id = 'non-existent-id';
      mockFriendRequestModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockFriendRequestModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });
  });
});