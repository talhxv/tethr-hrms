import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';

@InputType()
export class RecordTimeEntryInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be an ISO date (YYYY-MM-DD)' })
  date!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(24)
  hours!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
