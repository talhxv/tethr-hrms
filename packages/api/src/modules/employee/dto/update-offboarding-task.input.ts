import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class UpdateOffboardingTaskInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field()
  @IsString()
  taskKey!: string;

  @Field()
  @IsIn(['notStarted', 'inProgress', 'completed', 'blocked'])
  status!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be an ISO date' })
  dueDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
