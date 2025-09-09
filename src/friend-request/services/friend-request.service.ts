import { Injectable, Inject } from '@nestjs/common';
import { CreateFriendRequestInput } from '../dto/create-friend-request.input';
import { UpdateFriendRequestInput } from '../dto/update-friend-request.input';
import { FriendRequest, FriendRequestDocument } from '../entities/friend-request.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequestDocument>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) { }

  async create(createFriendRequestInput: CreateFriendRequestInput): Promise<FriendRequest> {
    const createdFriendRequest = new this.friendRequestModel(createFriendRequestInput);
    const savedRequest = await createdFriendRequest.save();

    // Limpiar cache de todas las solicitudes
    await this.redisClient.del('friend-requests:all');

    return savedRequest;
  }

  async findAll(): Promise<FriendRequest[]> {
    // Buscar en cache primero
    const cached = await this.redisClient.get('friend-requests:all');
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const friendRequests = await this.friendRequestModel.find().exec();
    await this.redisClient.setex('friend-requests:all', 3600, JSON.stringify(friendRequests)); // 1 hora
    return friendRequests;
  }

  async findOne(id: string): Promise<FriendRequest> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`friend-request:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const friendRequest = await this.friendRequestModel.findById(id).exec();
    if (!friendRequest) {
      throw new NotFoundException('Friend Request not found');
    }

    await this.redisClient.setex(`friend-request:${id}`, 3600, JSON.stringify(friendRequest)); // 1 hora
    return friendRequest;
  }

  async update(id: string, updateFriendRequestInput: UpdateFriendRequestInput): Promise<FriendRequest> {
    const updatedFriendRequest = await this.friendRequestModel.findByIdAndUpdate(id, updateFriendRequestInput, { new: true }).exec();
    if (!updatedFriendRequest) {
      throw new NotFoundException('Friend Request not found');
    }

    // Actualizar cache
    await this.redisClient.setex(`friend-request:${id}`, 3600, JSON.stringify(updatedFriendRequest));
    // Limpiar cache de todas las solicitudes
    await this.redisClient.del('friend-requests:all');

    return updatedFriendRequest;
  }

  async remove(id: string): Promise<FriendRequest> {
    const deletedFriendRequest = await this.friendRequestModel.findByIdAndDelete(id).exec();
    if (!deletedFriendRequest) {
      throw new NotFoundException('Friend Request not found');
    }

    // Limpiar cache
    await this.redisClient.del(`friend-request:${id}`);
    await this.redisClient.del('friend-requests:all');

    return deletedFriendRequest;
  }
}