import { Injectable } from '@nestjs/common';
import { CreateFriendRequestInput } from '../dto/create-friend-request.input';
import { UpdateFriendRequestInput } from '../dto/update-friend-request.input';
import { FriendRequest, FriendRequestDocument } from '../entities/friend-request.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequestDocument>,
  ) { }

  async create(createFriendRequestInput: CreateFriendRequestInput): Promise<FriendRequest> {
    const createdFriendRequest = new this.friendRequestModel(createFriendRequestInput);
    return createdFriendRequest.save();
  }

  async findAll(): Promise<FriendRequest[]> {
    return this.friendRequestModel.find().exec();
  }

  async findOne(id: string): Promise<FriendRequest> {
    const friendRequest = await this.friendRequestModel.findById(id).exec();
    if (!friendRequest) {
      throw new NotFoundException('Friend Request not found');
    }
    return friendRequest;
  }

  async update(id: string, updateFriendRequestInput: UpdateFriendRequestInput): Promise<FriendRequest> {
    const updatedFriendRequest = await this.friendRequestModel.findByIdAndUpdate(id, updateFriendRequestInput, { new: true }).exec();
    if (!updatedFriendRequest) {
      throw new NotFoundException('Friend Request not found');
    }
    return updatedFriendRequest;
  }

  async remove(id: string): Promise<FriendRequest> {
    const deletedFriendRequest = await this.friendRequestModel.findByIdAndDelete(id).exec();
    if (!deletedFriendRequest) {
      throw new NotFoundException('Friend Request not found');
    }
    return deletedFriendRequest;
  }

}
