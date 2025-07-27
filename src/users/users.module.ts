import { Module } from '@nestjs/common';
import { UserService } from './services/users.service';
import { UserResolver } from './resolvers/users.resolver';
import { AuthModule } from 'src/auth/auth.module';//

@Module({
  imports: [AuthModule], // Importing AuthModule if needed for authentication
  providers: [UserResolver, UserService],
  exports: [UserService], // Exporting UsersService for use in other modules
})
export class UsersModule { }
