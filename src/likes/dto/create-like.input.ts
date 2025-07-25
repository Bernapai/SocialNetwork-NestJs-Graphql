import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class CreateLikeInput {
  @Field(() => ID)
  @IsMongoId()
  postId: string;
}