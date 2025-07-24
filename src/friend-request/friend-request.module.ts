import { Module } from '@nestjs/common';
import { FriendRequestService } from './services/friend-request.service';
import { FriendRequestResolver } from './resolvers/friend-request.resolver';

@Module({
  providers: [FriendRequestResolver, FriendRequestService],
})
export class FriendRequestModule { }
