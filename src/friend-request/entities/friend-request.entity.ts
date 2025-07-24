import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class FriendRequest {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
