import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [UsersModule, PostsModule, LikesModule, FriendRequestModule, AuthModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
