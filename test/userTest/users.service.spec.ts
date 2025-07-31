import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserService } from 'src/users/services/users.service';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { UpdateUserInput } from 'src/users/dto/update-user.input';

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserDocument>;

  const mockUser = {
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

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const saveMock = jest.fn().mockResolvedValue(mockUser);
      const constructorMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      (model as any).mockImplementation = constructorMock;
      Object.setPrototypeOf(model, constructorMock);

      // Mock the constructor behavior
      jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: saveMock,
      }));

      // Create a mock instance
      const mockInstance = {
        save: saveMock,
      };
      jest.spyOn(service['userModel'], 'constructor' as any).mockReturnValue(mockInstance);

      const result = await service.create(createUserInput);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne(userId);

      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    const userId = '507f1f77bcf86cd799439011';
    const updateUserInput: UpdateUserInput = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, ...updateUserInput };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.update(userId, updateUserInput);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserInput,
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(userId, updateUserInput)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should delete and return the user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.remove(userId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';

    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail(email);

      expect(model.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    const username = 'testuser';

    it('should return a user by username', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByUsername(username);

      expect(model.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByUsername(username)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('searchByName', () => {
    const searchTerm = 'John';

    it('should return users matching the search term', async () => {
      const users = [mockUser];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });

      const result = await service.searchByName(searchTerm);

      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { username: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      expect(result).toEqual(users);
    });

    it('should return empty array if no users match', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.searchByName(searchTerm);

      expect(result).toEqual([]);
    });
  });
});