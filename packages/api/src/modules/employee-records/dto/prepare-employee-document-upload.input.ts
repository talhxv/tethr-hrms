import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class PrepareEmployeeDocumentUploadInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @MaxLength(256)
  name!: string;

  @Field()
  @IsString()
  @MaxLength(128)
  contentType!: string;
}
