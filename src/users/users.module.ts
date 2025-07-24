import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { AuthModule } from 'src/auth/auth.module';//

@Module({
  imports: [AuthModule], // Importing AuthModule if needed for authentication
  providers: [UsersResolver, UsersService],
  exports: [UsersService], // Exporting UsersService for use in other modules
})
export class UsersModule { }
