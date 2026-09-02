import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

@InputType()
export class UpdateEmployeeInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  middleName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['Mr', 'Ms', 'Mrs', 'Mx', 'Dr', 'Prof'])
  salutation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  workEmail?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  roleTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be an ISO date' })
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'probationEndDate must be an ISO date' })
  probationEndDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hireDate must be an ISO date' })
  hireDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduledConfirmationDate must be an ISO date' })
  scheduledConfirmationDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'finalConfirmationDate must be an ISO date' })
  finalConfirmationDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'contractEndDate must be an ISO date' })
  contractEndDate?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  noticePeriodDays?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'retirementDate must be an ISO date' })
  retirementDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  holidayCalendarId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['permanent', 'fixedTerm', 'contractor', 'intern', 'temporary'])
  workerType?: string;
}
