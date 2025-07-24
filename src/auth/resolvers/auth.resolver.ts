import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { CreateAuthInput } from '../dto/create-auth.input';
import { UpdateAuthInput } from '../dto/update-auth.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }
}
