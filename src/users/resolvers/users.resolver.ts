import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/users.service';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  // CRUD básico
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User], { name: 'users' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }


  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateMyProfile(
    @CurrentUser() currentUser: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(currentUser._id.toString(), updateUserInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  removeUser(@CurrentUser() currentUser: User,): Promise<User> {
    return this.userService.remove(currentUser._id.toString());
  }

  // Búsquedas específicas
  @Query(() => User, { name: 'userByEmail' })
  findByEmail(@Args('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Query(() => User, { name: 'userByUsername' })
  findByUsername(@Args('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @Query(() => [User], { name: 'searchUsers' })
  searchByName(@Args('searchTerm') searchTerm: string): Promise<User[]> {
    return this.userService.searchByName(searchTerm);
  }
}