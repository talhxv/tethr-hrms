import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateHiringRequestInput {
  @Field()
  @IsString()
  @MaxLength(200)
  positionTitle!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  headcount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['permanent', 'fixedTerm', 'contractor', 'intern', 'temporary'])
  employmentType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'preferredStartDate must be an ISO date (YYYY-MM-DD)',
  })
  preferredStartDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  clientNote?: string;
}
