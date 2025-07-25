import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class CreateFriendRequestInput {
  @Field(() => ID)
  @IsMongoId()
  receiverId: string;
}