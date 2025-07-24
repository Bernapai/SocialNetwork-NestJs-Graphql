import { Module } from '@nestjs/common';
import { LikesService } from './services/likes.service';
import { LikesResolver } from './resolvers/likes.resolver';

@Module({
  providers: [LikesResolver, LikesService],
})
export class LikesModule { }
