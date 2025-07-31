import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UserResolver } from 'src/users/resolvers/users.resolver';
import { UserService } from 'src/users/services/users.service';
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { UpdateUserInput } from 'src/users/dto/update-user.input';;
import { User } from 'src/users/entities/user.entity';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;

  const mockUser: User = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'avatar.jpg',
    bio: 'Test bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCurrentUser: User = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    email: 'current@example.com',
    username: 'currentuser',
    password: 'hashedpassword',
    firstName: 'Current',
    lastName: 'User',
    avatar: 'current-avatar.jpg',
    bio: 'Current user bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    searchByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await resolver.createUser(createUserInput);

      expect(userService.create).toHaveBeenCalledWith(createUserInput);
      expect(result).toEqual(mockUser);
    });

    it('should handle service errors', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const error = new Error('Email already exists');
      mockUserService.create.mockRejectedValue(error);

      await expect(resolver.createUser(createUserInput)).rejects.toThrow(error);
      expect(userService.create).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await resolver.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should return a user by id', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await resolver.findOne(userId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      const error = new Error('User not found');
      mockUserService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne(userId)).rejects.toThrow(error);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateMyProfile', () => {
    it('should update current user profile', async () => {
      const updateUserInput: UpdateUserInput = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = { ...mockCurrentUser, ...updateUserInput };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await resolver.updateMyProfile(mockCurrentUser, updateUserInput);

      expect(userService.update).toHaveBeenCalledWith(
        mockCurrentUser._id.toString(),
        updateUserInput
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle update errors', async () => {
      const updateUserInput: UpdateUserInput = {
        email: 'newemail@example.com',
      };

      const error = new Error('Email already exists');
      mockUserService.update.mockRejectedValue(error);

      await expect(
        resolver.updateMyProfile(mockCurrentUser, updateUserInput)
      ).rejects.toThrow(error);
    });
  });

  describe('removeUser', () => {
    it('should remove current user', async () => {
      mockUserService.remove.mockResolvedValue(mockCurrentUser);

      const result = await resolver.removeUser(mockCurrentUser);

      expect(userService.remove).toHaveBeenCalledWith(
        mockCurrentUser._id.toString()
      );
      expect(result).toEqual(mockCurrentUser);
    });

    it('should handle removal errors', async () => {
      const error = new Error('User not found');
      mockUserService.remove.mockRejectedValue(error);

      await expect(resolver.removeUser(mockCurrentUser)).rejects.toThrow(error);
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';

    it('should return user by email', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await resolver.findByEmail(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found by email', async () => {
      const error = new Error('User not found');
      mockUserService.findByEmail.mockRejectedValue(error);

      await expect(resolver.findByEmail(email)).rejects.toThrow(error);
    });
  });

  describe('findByUsername', () => {
    const username = 'testuser';

    it('should return user by username', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);

      const result = await resolver.findByUsername(username);

      expect(userService.findByUsername).toHaveBeenCalledWith(username);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found by username', async () => {
      const error = new Error('User not found');
      mockUserService.findByUsername.mockRejectedValue(error);

      await expect(resolver.findByUsername(username)).rejects.toThrow(error);
    });
  });

  describe('searchByName', () => {
    const searchTerm = 'John';

    it('should return users matching search term', async () => {
      const users = [mockUser];
      mockUserService.searchByName.mockResolvedValue(users);

      const result = await resolver.searchByName(searchTerm);

      expect(userService.searchByName).toHaveBeenCalledWith(searchTerm);
      expect(result).toEqual(users);
    });

    it('should return empty array when no matches found', async () => {
      mockUserService.searchByName.mockResolvedValue([]);

      const result = await resolver.searchByName(searchTerm);

      expect(userService.searchByName).toHaveBeenCalledWith(searchTerm);
      expect(result).toEqual([]);
    });

    it('should handle search errors', async () => {
      const error = new Error('Search failed');
      mockUserService.searchByName.mockRejectedValue(error);

      await expect(resolver.searchByName(searchTerm)).rejects.toThrow(error);
    });
  });
});