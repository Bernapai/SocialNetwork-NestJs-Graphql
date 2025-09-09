import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/entities/user.entity';
import { Post, PostSchema } from './posts/entities/post.entity';
import { Like, LikeSchema } from './likes/entities/like.entity';
import { FriendRequest, FriendRequestSchema } from './friend-request/entities/friend-request.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      debug: true,
      introspection: true,
      sortSchema: true,

    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    UsersModule,
    PostsModule,
    LikesModule,
    FriendRequestModule,
    AuthModule,
    DatabaseModule,
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
