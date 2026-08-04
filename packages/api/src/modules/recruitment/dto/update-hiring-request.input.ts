import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class UpdateHiringRequestInput {
  @Field(() => ID)
  @IsUUID()
  hiringRequestId!: string;

  @Field()
  @IsIn(['submitted', 'inReview', 'sourcing', 'interviewing', 'offer', 'filled', 'cancelled'])
  status!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  tethrNote?: string | null;
}
