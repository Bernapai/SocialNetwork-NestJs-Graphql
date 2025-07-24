import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateFriendRequestInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
