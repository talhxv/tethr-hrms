import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class CreateLeaveTypeInput {
  @Field()
  @IsString()
  @MaxLength(64)
  name!: string;

  @Field()
  @IsString()
  @MaxLength(32)
  code!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['day', 'hour'])
  unit?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(366)
  defaultAnnualEntitlement?: number;
}
