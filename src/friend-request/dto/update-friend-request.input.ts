import { CreateFriendRequestInput } from './create-friend-request.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFriendRequestInput extends PartialType(CreateFriendRequestInput) {
  @Field(() => Int)
  id: number;
}
