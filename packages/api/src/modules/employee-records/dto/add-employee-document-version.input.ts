import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsISO8601,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class AddEmployeeDocumentVersionInput {
  @Field(() => ID)
  @IsUUID()
  employeeDocumentLinkId!: string;

  @Field()
  @IsString()
  @MaxLength(128)
  contentType!: string;

  @Field()
  @IsString()
  @MaxLength(512)
  storageKey!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['notRequired', 'pending', 'signed', 'declined', 'expired'])
  signatureStatus?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsISO8601()
  signedAt?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  signatureProvider?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalEnvelopeId?: string | null;
}
