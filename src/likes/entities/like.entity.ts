import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Like {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  @Field(() => ID)
  postId: Types.ObjectId;

  @Field(() => User)
  user: User; // Campo virtual para GraphQL

  @Field(() => Post)
  post: Post; // Campo virtual para GraphQL

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);