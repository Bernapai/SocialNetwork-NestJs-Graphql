import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../entities/friend-request.entity';
import { CreateFriendRequestInput } from '../dto/create-friend-request.input';
import { UpdateFriendRequestInput } from '../dto/update-friend-request.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly friendRequestService: FriendRequestService) { }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => FriendRequest)
  createFriendRequest(@Args('createFriendRequestInput') createFriendRequestInput: CreateFriendRequestInput): Promise<FriendRequest> {
    return this.friendRequestService.create(createFriendRequestInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [FriendRequest], { name: 'friendRequests' })
  findAll(): Promise<FriendRequest[]> {
    return this.friendRequestService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => FriendRequest, { name: 'friendRequest' })
  findOne(@Args('id', { type: () => String }) id: string): Promise<FriendRequest> {
    return this.friendRequestService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [FriendRequest], { name: 'myFriendRequests' })
  async findMyFriendRequests(@CurrentUser() currentUser: User): Promise<FriendRequest[]> {
    const friendRequests = await this.friendRequestService.findAll();
    return friendRequests.filter(request =>
      request.receiverId.toString() === currentUser._id.toString()
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => FriendRequest)
  async updateFriendRequest(
    @Args('id', { type: () => String }) id: string,
    @Args('updateFriendRequestInput') updateFriendRequestInput: UpdateFriendRequestInput,
  ): Promise<FriendRequest> {
    return this.friendRequestService.update(id, updateFriendRequestInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => FriendRequest)
  async removeFriendRequest(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<FriendRequest> {
    const friendRequest = await this.friendRequestService.findOne(id);

    if (friendRequest.senderId.toString() !== currentUser._id.toString()) {
      throw new ForbiddenException('Solo puedes eliminar tus propias solicitudes de amistad');
    }

    return this.friendRequestService.remove(id);
  }


}
