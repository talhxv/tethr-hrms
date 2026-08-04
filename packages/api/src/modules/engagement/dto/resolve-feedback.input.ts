import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class ResolveFeedbackInput {
  @Field(() => ID)
  @IsUUID()
  employeeFeedbackId!: string;

  @Field()
  @IsIn(['submitted', 'inReview', 'resolved'])
  status!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  resolutionNote?: string | null;
}
