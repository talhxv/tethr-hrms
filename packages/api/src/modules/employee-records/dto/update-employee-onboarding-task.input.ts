import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class UpdateEmployeeOnboardingTaskInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsIn(['profile', 'contract', 'nda', 'resume', 'bankDetails', 'hardware', 'employeeRecordForm'])
  taskKey!: string;

  @Field()
  @IsIn(['notStarted', 'inProgress', 'completed', 'blocked'])
  status!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dueDate?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string | null;
}
