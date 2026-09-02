import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

@InputType()
export class CreateEmployeeEducationInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field()
  @IsString()
  @MaxLength(256)
  schoolOrUniversity!: string;

  @Field()
  @IsString()
  @MaxLength(256)
  qualification!: string;

  @Field()
  @IsIn(['graduate', 'postGraduate', 'underGraduate'])
  level!: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearOfPassing?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  classOrPercentage?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  majorSubjects?: string;
}

@InputType()
export class UpdateEmployeeEducationInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  schoolOrUniversity?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  qualification?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['graduate', 'postGraduate', 'underGraduate'])
  level?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearOfPassing?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  classOrPercentage?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  majorSubjects?: string;
}
