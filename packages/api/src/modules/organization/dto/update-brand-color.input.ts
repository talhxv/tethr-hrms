import { WORKSPACE_BRAND_COLORS } from '@hrms/shared';
import { Field, InputType } from '@nestjs/graphql';
import { IsIn } from 'class-validator';

@InputType()
export class UpdateBrandColorInput {
  @Field()
  @IsIn([...WORKSPACE_BRAND_COLORS])
  brandColor!: string;
}
