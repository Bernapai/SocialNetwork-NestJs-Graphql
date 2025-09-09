import { Injectable, Inject } from '@nestjs/common';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User, UserDocument } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const createdUser = new this.userModel(createUserInput);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    // Buscar en cache primero
    const cached = await this.redisClient.get('users:all');
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const users = await this.userModel.find().exec();
    await this.redisClient.setex('users:all', 3600, JSON.stringify(users)); // 1 hora
    return users;
  }

  async findOne(id: string): Promise<User> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisClient.setex(`user:${id}`, 3600, JSON.stringify(user)); // 1 hora
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserInput, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Actualizar cache
    await this.redisClient.setex(`user:${id}`, 3600, JSON.stringify(updatedUser));
    // Limpiar cache de todos los usuarios
    await this.redisClient.del('users:all');

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    // Limpiar cache
    await this.redisClient.del(`user:${id}`);
    await this.redisClient.del('users:all');

    return deletedUser;
  }

  async findByEmail(email: string): Promise<User> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`user:email:${email}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisClient.setex(`user:email:${email}`, 3600, JSON.stringify(user));
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`user:username:${username}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisClient.setex(`user:username:${username}`, 3600, JSON.stringify(user));
    return user;
  }

  async searchByName(searchTerm: string): Promise<User[]> {
    return this.userModel.find({
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } }
      ]
    }).exec();
  }
}