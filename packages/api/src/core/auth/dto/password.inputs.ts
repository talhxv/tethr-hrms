import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ResetWorkspaceUserPasswordInput {
  @Field(() => ID)
  @IsString()
  userId!: string;
}

@InputType()
export class ChangeMyPasswordInput {
  @Field()
  @IsString()
  @MaxLength(128)
  currentPassword!: string;

  // Length policy is enforced in AuthService.changeOwnPassword so the message
  // is the same one the API returns everywhere.
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  newPassword!: string;
}
