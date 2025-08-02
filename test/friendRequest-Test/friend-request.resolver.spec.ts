import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendRequestResolver } from 'src/friend-request/resolvers/friend-request.resolver';
import { FriendRequestService } from 'src/friend-request/services/friend-request.service';
import { FriendRequest, FriendRequestStatus } from 'src/friend-request/entities/friend-request.entity';
import { CreateFriendRequestInput } from 'src/friend-request/dto/create-friend-request.input';
import { UpdateFriendRequestInput } from 'src/friend-request/dto/update-friend-request.input';
import { User } from 'src/users/entities/user.entity';

describe('FriendRequestResolver', () => {
  let resolver: FriendRequestResolver;
  let service: FriendRequestService;

  const mockUserId1 = new Types.ObjectId();
  const mockUserId2 = new Types.ObjectId();
  const mockFriendRequestId = new Types.ObjectId();

  const mockUser1: User = {
    _id: mockUserId1,
    email: 'user1@test.com',
    username: 'user1',
    password: 'hashedpassword',
    firstName: 'User',
    lastName: 'One',
    avatar: '',
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser2: User = {
    _id: mockUserId2,
    email: 'user2@test.com',
    username: 'user2',
    password: 'hashedpassword',
    firstName: 'User',
    lastName: 'Two',
    avatar: '',
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFriendRequest: FriendRequest = {
    _id: mockFriendRequestId,
    senderId: mockUserId1,
    receiverId: mockUserId2,
    status: FriendRequestStatus.PENDING,
    sender: mockUser1,
    receiver: mockUser2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFriendRequestService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestResolver,
        {
          provide: FriendRequestService,
          useValue: mockFriendRequestService,
        },
      ],
    }).compile();

    resolver = module.get<FriendRequestResolver>(FriendRequestResolver);
    service = module.get<FriendRequestService>(FriendRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createFriendRequest', () => {
    it('should create a friend request successfully', async () => {
      const createInput: CreateFriendRequestInput = {
        receiverId: mockUserId2.toString(),
      };

      mockFriendRequestService.create.mockResolvedValue(mockFriendRequest);

      const result = await resolver.createFriendRequest(createInput);

      expect(result).toEqual(mockFriendRequest);
      expect(service.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('findAll', () => {
    it('should return all friend requests', async () => {
      const friendRequests = [mockFriendRequest];
      mockFriendRequestService.findAll.mockResolvedValue(friendRequests);

      const result = await resolver.findAll();

      expect(result).toEqual(friendRequests);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a friend request by id', async () => {
      mockFriendRequestService.findOne.mockResolvedValue(mockFriendRequest);

      const result = await resolver.findOne(mockFriendRequestId.toString());

      expect(result).toEqual(mockFriendRequest);
      expect(service.findOne).toHaveBeenCalledWith(mockFriendRequestId.toString());
    });
  });

  describe('findMyFriendRequests', () => {
    it('should return friend requests for current user as receiver', async () => {
      const allFriendRequests = [
        mockFriendRequest,
        {
          ...mockFriendRequest,
          _id: new Types.ObjectId(),
          senderId: mockUserId2,
          receiverId: mockUserId1,
        },
      ];

      mockFriendRequestService.findAll.mockResolvedValue(allFriendRequests);

      const result = await resolver.findMyFriendRequests(mockUser2);

      expect(result).toHaveLength(1);
      expect(result[0].receiverId.toString()).toBe(mockUserId2.toString());
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no friend requests found for user', async () => {
      const allFriendRequests = [
        {
          ...mockFriendRequest,
          receiverId: new Types.ObjectId(), // Different receiver
        },
      ];

      mockFriendRequestService.findAll.mockResolvedValue(allFriendRequests);

      const result = await resolver.findMyFriendRequests(mockUser1);

      expect(result).toHaveLength(0);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('updateFriendRequest', () => {
    it('should update a friend request successfully', async () => {
      const updateInput: UpdateFriendRequestInput = {
        status: FriendRequestStatus.ACCEPTED,
      };

      const updatedFriendRequest = {
        ...mockFriendRequest,
        status: FriendRequestStatus.ACCEPTED,
      };

      mockFriendRequestService.update.mockResolvedValue(updatedFriendRequest);

      const result = await resolver.updateFriendRequest(
        mockFriendRequestId.toString(),
        updateInput
      );

      expect(result).toEqual(updatedFriendRequest);
      expect(service.update).toHaveBeenCalledWith(
        mockFriendRequestId.toString(),
        updateInput
      );
    });
  });

  describe('removeFriendRequest', () => {
    it('should remove friend request when user is the sender', async () => {
      mockFriendRequestService.findOne.mockResolvedValue(mockFriendRequest);
      mockFriendRequestService.remove.mockResolvedValue(mockFriendRequest);

      const result = await resolver.removeFriendRequest(
        mockUser1,
        mockFriendRequestId.toString()
      );

      expect(result).toEqual(mockFriendRequest);
      expect(service.findOne).toHaveBeenCalledWith(mockFriendRequestId.toString());
      expect(service.remove).toHaveBeenCalledWith(mockFriendRequestId.toString());
    });

    it('should throw ForbiddenException when user is not the sender', async () => {
      mockFriendRequestService.findOne.mockResolvedValue(mockFriendRequest);

      await expect(
        resolver.removeFriendRequest(mockUser2, mockFriendRequestId.toString())
      ).rejects.toThrow(ForbiddenException);

      await expect(
        resolver.removeFriendRequest(mockUser2, mockFriendRequestId.toString())
      ).rejects.toThrow('Solo puedes eliminar tus propias solicitudes de amistad');

      expect(service.findOne).toHaveBeenCalledWith(mockFriendRequestId.toString());
      expect(service.remove).not.toHaveBeenCalled();
    });

    it('should throw error when friend request not found', async () => {
      const error = new Error('Friend request not found');
      mockFriendRequestService.findOne.mockRejectedValue(error);

      await expect(
        resolver.removeFriendRequest(mockUser1, 'nonexistent-id')
      ).rejects.toThrow(error);

      expect(service.findOne).toHaveBeenCalledWith('nonexistent-id');
      expect(service.remove).not.toHaveBeenCalled();
    });
  });
});