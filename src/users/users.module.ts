import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './resolvers/users.resolver';

@Module({
  providers: [UsersResolver, UsersService],
})
export class UsersModule { }
