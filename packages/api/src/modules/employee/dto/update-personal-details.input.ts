import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class UpdatePersonalDetailsInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  // HR-maintained only: identity numbers are verified against the card, so the
  // self-service input below deliberately does not accept it.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^[0-9A-Za-z-]+$/, { message: 'nationalIdNumber may contain only letters, digits and dashes' })
  nationalIdNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  passportNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'passportIssueDate must be an ISO date' })
  passportIssueDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  passportIssuePlace?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'passportValidUpto must be an ISO date' })
  passportValidUpto?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['single', 'married', 'divorced', 'widowed'])
  maritalStatus?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  familyBackground?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  healthDetails?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}

@InputType()
export class UpdateMyPersonalDetailsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  passportNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'passportIssueDate must be an ISO date' })
  passportIssueDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  passportIssuePlace?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'passportValidUpto must be an ISO date' })
  passportValidUpto?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['single', 'married', 'divorced', 'widowed'])
  maritalStatus?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  familyBackground?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  healthDetails?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}
