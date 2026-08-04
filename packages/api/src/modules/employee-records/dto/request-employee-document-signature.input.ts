import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class RequestEmployeeDocumentSignatureInput {
  @Field(() => ID)
  @IsUUID()
  employeeDocumentLinkId!: string;

  @Field()
  @IsEmail()
  signerEmail!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  signerName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  provider?: string | null;
}
