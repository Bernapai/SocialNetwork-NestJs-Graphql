import { Module } from '@nestjs/common';
import { LikesService } from './services/likes.service';
import { LikesResolver } from './resolvers/likes.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { Like, LikeSchema } from './entities/like.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    AuthModule], // Importing AuthModule if needed for authentication
  providers: [LikesResolver, LikesService],
})
export class LikesModule { }
