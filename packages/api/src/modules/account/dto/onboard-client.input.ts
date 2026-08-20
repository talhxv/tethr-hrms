import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

@InputType()
export class OnboardClientInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  legalName!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  displayName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 8)
  defaultLocale?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  defaultCurrency?: string | null;

  @Field()
  @IsEmail()
  adminEmail!: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  adminPassword!: string;

  @Field()
  @IsEmail()
  hrAdminEmail!: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  hrAdminPassword!: string;
}
