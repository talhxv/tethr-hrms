import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class SeparateEmployeeInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field()
  @IsIn(['resignation', 'termination', 'retirement', 'other'])
  type!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'effectiveDate must be an ISO date (YYYY-MM-DD)' })
  effectiveDate!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'resignationLetterDate must be an ISO date' })
  resignationLetterDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'relievingDate must be an ISO date' })
  relievingDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reasonForLeaving?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  leaveEncashed?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'encashmentDate must be an ISO date' })
  encashmentDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'heldOn must be an ISO date' })
  heldOn?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  newWorkplace?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string;
}
