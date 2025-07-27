import { InputType } from "@nestjs/graphql";
import { Field } from "@nestjs/graphql";
import { IsString, MinLength, MaxLength } from "class-validator";


@InputType()
export class LoginInput {
    @Field()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;
}