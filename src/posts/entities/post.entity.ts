import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Post {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ required: true })
  @Field()
  content: string;

  @Prop([String])
  @Field(() => [String], { nullable: true })
  images?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  authorId: Types.ObjectId;

  @Field(() => User)
  author: User; // Campo virtual para GraphQL

  @Prop({ default: 0 })
  @Field(() => Int)
  likesCount: number;

  @Prop({ default: 0 })
  @Field(() => Int)
  commentsCount: number;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);