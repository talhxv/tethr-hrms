import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class PublishAnnouncementInput {
  @Field()
  @IsString()
  @MaxLength(200)
  title!: string;

  @Field()
  @IsString()
  @MaxLength(8000)
  body!: string;

  @Field()
  @IsIn(['all', 'tethr', 'client', 'employee'])
  audience!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'expiresAt must be an ISO date (YYYY-MM-DD)',
  })
  expiresAt?: string | null;
}
