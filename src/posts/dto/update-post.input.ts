import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];
}