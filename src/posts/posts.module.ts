import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsResolver } from './resolvers/posts.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { Post, PostSchema } from './entities/post.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    AuthModule
  ], // Importing AuthModule if needed for authentication
  providers: [PostsResolver, PostsService],
})
export class PostsModule { }
