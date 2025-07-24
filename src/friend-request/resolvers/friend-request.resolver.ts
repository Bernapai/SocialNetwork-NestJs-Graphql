import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../entities/friend-request.entity';
import { CreateFriendRequestInput } from '../dto/create-friend-request.input';
import { UpdateFriendRequestInput } from '../dto/update-friend-request.input';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly friendRequestService: FriendRequestService) { }

  @Mutation(() => FriendRequest)
  createFriendRequest(@Args('createFriendRequestInput') createFriendRequestInput: CreateFriendRequestInput) {
    return this.friendRequestService.create(createFriendRequestInput);
  }

  @Query(() => [FriendRequest], { name: 'friendRequest' })
  findAll() {
    return this.friendRequestService.findAll();
  }

  @Query(() => FriendRequest, { name: 'friendRequest' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.friendRequestService.findOne(id);
  }

  @Mutation(() => FriendRequest)
  updateFriendRequest(@Args('updateFriendRequestInput') updateFriendRequestInput: UpdateFriendRequestInput) {
    return this.friendRequestService.update(updateFriendRequestInput.id, updateFriendRequestInput);
  }

  @Mutation(() => FriendRequest)
  removeFriendRequest(@Args('id', { type: () => Int }) id: number) {
    return this.friendRequestService.remove(id);
  }
}
