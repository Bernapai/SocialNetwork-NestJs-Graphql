import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';
import { AuthResponse } from '../dto/authResponse.input';
import { User } from 'src/users/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => User)
  async register(@Args('input') registerInput: RegisterInput): Promise<User> {
    return this.authService.register(registerInput);
  }
}