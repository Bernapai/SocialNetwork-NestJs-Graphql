import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, MaxLength, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  @MaxLength(5000)
  content: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];
}