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

  const mockFriendRequestId = new Types.ObjectId();
  const mockSenderId = new Types.ObjectId();
  const mockReceiverId = new Types.ObjectId();

  const mockFriendRequest = {
    _id: mockFriendRequestId,
    senderId: mockSenderId,
    receiverId: mockReceiverId,
    status: FriendRequestStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockFriendRequestModel = {
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
    it('should create a friend request successfully', async () => {
      const createDto: CreateFriendRequestInput = {
        receiverId: mockReceiverId.toString(),
      };

      // Mock the save method
      const saveSpy = jest.fn().mockResolvedValue(mockFriendRequest);

      // Mock the model constructor
      const mockConstructor = jest.fn().mockImplementation(() => ({
        ...mockFriendRequest,
        save: saveSpy,
      }));

      // Replace the model with our mock constructor
      (service as any).friendRequestModel = mockConstructor;

      const result = await service.create(createDto);

      expect(result).toEqual(mockFriendRequest);
      expect(mockConstructor).toHaveBeenCalledWith(createDto);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of friend requests', async () => {
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
      mockFriendRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFriendRequest),
      });

      const result = await service.findOne(mockFriendRequestId.toString());

      expect(result).toEqual(mockFriendRequest);
      expect(mockFriendRequestModel.findById).toHaveBeenCalledWith(mockFriendRequestId.toString());
    });

    it('should throw NotFoundException when friend request not found', async () => {
      mockFriendRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow('Friend Request not found');
    });
  });

  describe('update', () => {
    it('should update a friend request successfully', async () => {
      const updateDto: UpdateFriendRequestInput = {
        status: FriendRequestStatus.ACCEPTED,
      };

      const updatedFriendRequest = {
        ...mockFriendRequest,
        status: FriendRequestStatus.ACCEPTED,
      };

      mockFriendRequestModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedFriendRequest),
      });

      const result = await service.update(mockFriendRequestId.toString(), updateDto);

      expect(result).toEqual(updatedFriendRequest);
      expect(mockFriendRequestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockFriendRequestId.toString(),
        updateDto,
        { new: true }
      );
    });

    it('should throw NotFoundException when trying to update non-existent friend request', async () => {
      const updateDto: UpdateFriendRequestInput = {
        status: FriendRequestStatus.ACCEPTED,
      };

      mockFriendRequestModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow('Friend Request not found');
    });
  });

  describe('remove', () => {
    it('should remove a friend request successfully', async () => {
      mockFriendRequestModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFriendRequest),
      });

      const result = await service.remove(mockFriendRequestId.toString());

      expect(result).toEqual(mockFriendRequest);
      expect(mockFriendRequestModel.findByIdAndDelete).toHaveBeenCalledWith(mockFriendRequestId.toString());
    });

    it('should throw NotFoundException when trying to remove non-existent friend request', async () => {
      mockFriendRequestModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.remove('nonexistent-id')).rejects.toThrow('Friend Request not found');
    });
  });
});
