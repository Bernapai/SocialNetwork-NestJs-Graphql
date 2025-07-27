import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UserService } from '../services/users.service';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  // CRUD básico
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.remove(id);
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