import { InputType, Field } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { FriendRequestStatus } from '../entities/friend-request.entity';

@InputType()
export class UpdateFriendRequestInput {
  @Field(() => FriendRequestStatus)
  @IsEnum(FriendRequestStatus)
  status: FriendRequestStatus;
}