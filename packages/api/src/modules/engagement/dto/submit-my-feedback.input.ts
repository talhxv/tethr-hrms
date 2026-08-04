import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsString, MaxLength } from 'class-validator';

@InputType()
export class SubmitMyFeedbackInput {
  @Field()
  @IsIn(['general', 'people', 'pay', 'leave', 'workplace'])
  category!: string;

  @Field()
  @IsString()
  @MaxLength(160)
  subject!: string;

  @Field()
  @IsString()
  @MaxLength(8000)
  body!: string;
}
