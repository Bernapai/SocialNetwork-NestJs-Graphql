// dto/auth.response.ts
import { ObjectType, Field } from '@nestjs/graphql';
import { RegisterInput } from './register.input';

@ObjectType()
export class AuthResponse {
    @Field()
    access_token: string;

    @Field(() => RegisterInput)
    usuario: RegisterInput;
}