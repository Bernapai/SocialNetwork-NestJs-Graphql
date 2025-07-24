import { Module } from '@nestjs/common';
import { LikesService } from './services/likes.service';
import { LikesResolver } from './resolvers/likes.resolver';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [AuthModule], // Importing AuthModule if needed for authentication
  providers: [LikesResolver, LikesService],
})
export class LikesModule { }
