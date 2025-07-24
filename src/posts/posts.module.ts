import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsResolver } from './resolvers/posts.resolver';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule], // Importing AuthModule if needed for authentication
  providers: [PostsResolver, PostsService],
})
export class PostsModule { }
