import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

registerEnumType(FriendRequestStatus, {
  name: 'FriendRequestStatus',
});

export type FriendRequestDocument = FriendRequest & Document;

@Schema({ timestamps: true })
@ObjectType()
export class FriendRequest {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  receiverId: Types.ObjectId;

  @Prop({
    type: String,
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING
  })
  @Field(() => FriendRequestStatus)
  status: FriendRequestStatus;

  @Field(() => User)
  sender: User; // Campo virtual para GraphQL

  @Field(() => User)
  receiver: User; // Campo virtual para GraphQL

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);