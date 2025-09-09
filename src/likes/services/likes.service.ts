import { Injectable, Inject } from '@nestjs/common';
import { CreateLikeInput } from '../dto/create-like.input';
import { Like, LikeDocument } from '../entities/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: Model<LikeDocument>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) { }

  async create(createLikeInput: CreateLikeInput): Promise<Like> {
    const createdLike = new this.likeModel(createLikeInput);
    const savedLike = await createdLike.save();

    // Limpiar cache de todos los likes
    await this.redisClient.del('likes:all');

    return savedLike;
  }

  async findAll(): Promise<Like[]> {
    // Buscar en cache primero
    const cached = await this.redisClient.get('likes:all');
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const likes = await this.likeModel.find().exec();
    await this.redisClient.setex('likes:all', 3600, JSON.stringify(likes)); // 1 hora
    return likes;
  }

  async findOne(id: string): Promise<Like> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`like:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const like = await this.likeModel.findById(id).exec();
    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.redisClient.setex(`like:${id}`, 3600, JSON.stringify(like)); // 1 hora
    return like;
  }

  async remove(id: string): Promise<Like> {
    const deletedLike = await this.likeModel.findByIdAndDelete(id).exec();
    if (!deletedLike) {
      throw new NotFoundException('Like not found');
    }

    // Limpiar cache
    await this.redisClient.del(`like:${id}`);
    await this.redisClient.del('likes:all');

    return deletedLike;
  }
}