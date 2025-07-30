import { Module } from '@nestjs/common';
import { FriendRequestService } from './services/friend-request.service';
import { FriendRequestResolver } from './resolvers/friend-request.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { FriendRequest, FriendRequestSchema } from './entities/friend-request.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
    AuthModule], // Importing AuthModule for authentication
  providers: [FriendRequestResolver, FriendRequestService],
})
export class FriendRequestModule { }
