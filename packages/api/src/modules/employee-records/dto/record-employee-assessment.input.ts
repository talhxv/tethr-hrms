import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';

@InputType()
export class RecordEmployeeAssessmentInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @MaxLength(160)
  title!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'assessmentDate must be an ISO date (YYYY-MM-DD)',
  })
  assessmentDate!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  assessorName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notes?: string | null;
}
