import { Injectable, Inject } from '@nestjs/common';
import { CreatePostInput } from '../dto/create-post.input';
import { UpdatePostInput } from '../dto/update-post.input';
import { Post, PostDocument } from '../entities/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) { }

  async create(createPostInput: CreatePostInput): Promise<Post> {
    const createdPost = new this.postModel(createPostInput);
    const savedPost = await createdPost.save();

    // Limpiar cache de todos los posts
    await this.redisClient.del('posts:all');

    return savedPost;
  }

  async findAll(): Promise<Post[]> {
    // Buscar en cache primero
    const cached = await this.redisClient.get('posts:all');
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const posts = await this.postModel.find().exec();
    await this.redisClient.setex('posts:all', 1800, JSON.stringify(posts)); // 30 minutos
    return posts;
  }

  async findOne(id: string): Promise<Post> {
    // Buscar en cache primero
    const cached = await this.redisClient.get(`post:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, buscar en BD y guardar en cache
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.redisClient.setex(`post:${id}`, 1800, JSON.stringify(post)); // 30 minutos
    return post;
  }

  async update(id: string, updatePostInput: UpdatePostInput): Promise<Post> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostInput, { new: true })
      .exec();

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }

    // Actualizar cache
    await this.redisClient.setex(`post:${id}`, 1800, JSON.stringify(updatedPost));
    // Limpiar cache de todos los posts
    await this.redisClient.del('posts:all');

    return updatedPost;
  }

  async remove(id: string): Promise<Post> {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }

    // Limpiar cache
    await this.redisClient.del(`post:${id}`);
    await this.redisClient.del('posts:all');

    return deletedPost;
  }
}