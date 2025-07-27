import { Injectable } from '@nestjs/common';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User, UserDocument } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const createdUser = new this.userModel(createUserInput);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserInput, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }

  // Búsquedas específicas
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
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