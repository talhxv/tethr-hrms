import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class SelectWorkspaceInput {
  @Field()
  @IsString()
  @MinLength(1)
  selectionToken!: string;

  @Field()
  @IsString()
  @MinLength(1)
  organizationId!: string;
}
