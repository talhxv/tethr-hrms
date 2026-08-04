import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Validation lives at the boundary (architecture.md §6.5); internal code trusts
// its inputs. The global ValidationPipe enforces these before the resolver runs.
@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsString()
  @MaxLength(32)
  employeeNumber!: string;

  @Field()
  @IsString()
  @MaxLength(128)
  firstName!: string;

  @Field()
  @IsString()
  @MaxLength(128)
  lastName!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  roleTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be an ISO date (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'probationEndDate must be an ISO date (YYYY-MM-DD)',
  })
  probationEndDate?: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hireDate must be an ISO date (YYYY-MM-DD)' })
  hireDate!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['permanent', 'fixedTerm', 'contractor', 'intern', 'temporary'])
  workerType?: string;
}
