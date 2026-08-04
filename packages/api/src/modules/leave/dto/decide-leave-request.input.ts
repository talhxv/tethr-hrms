import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class DecideLeaveRequestInput {
  @Field(() => ID)
  @IsUUID()
  leaveRequestId!: string;

  @Field(() => ID)
  @IsUUID()
  decidedByUserId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
