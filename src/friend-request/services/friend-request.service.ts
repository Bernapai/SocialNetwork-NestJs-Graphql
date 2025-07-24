import { Injectable } from '@nestjs/common';
import { CreateFriendRequestInput } from '../dto/create-friend-request.input';
import { UpdateFriendRequestInput } from '../dto/update-friend-request.input';

@Injectable()
export class FriendRequestService {
  create(createFriendRequestInput: CreateFriendRequestInput) {
    return 'This action adds a new friendRequest';
  }

  findAll() {
    return `This action returns all friendRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendRequest`;
  }

  update(id: number, updateFriendRequestInput: UpdateFriendRequestInput) {
    return `This action updates a #${id} friendRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendRequest`;
  }
}
