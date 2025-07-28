import { Injectable } from '@nestjs/common';
import { CreateLikeInput } from '../dto/create-like.input';
import { Like, LikeDocument } from '../entities/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: Model<LikeDocument>,
  ) { }

  async create(createLikeInput: CreateLikeInput): Promise<Like> {
    const createdLike = new this.likeModel(createLikeInput);
    return createdLike.save();
  }

  async findAll(): Promise<Like[]> {
    return this.likeModel.find().exec();
  }

  async findOne(id: string): Promise<Like> {
    const like = await this.likeModel.findById(id).exec();
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    return like;
  }

  async remove(id: string): Promise<Like> {
    const deletedLike = await this.likeModel.findByIdAndDelete(id).exec();
    if (!deletedLike) {
      throw new NotFoundException('Like not found');
    }
    return deletedLike;
  }

}
