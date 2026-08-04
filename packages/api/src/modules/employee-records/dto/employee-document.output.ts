import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeDocument')
export class EmployeeDocumentView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  documentId!: string;

  @Field()
  category!: string;

  @Field()
  visibility!: string;

  @Field()
  name!: string;

  @Field()
  contentType!: string;

  @Field(() => Int)
  sizeBytes!: number;

  @Field()
  classification!: string;

  @Field()
  latestStorageKey!: string;

  @Field(() => Int)
  latestVersionNumber!: number;

  @Field(() => Int)
  versionCount!: number;

  @Field()
  signatureStatus!: string;

  @Field(() => String, { nullable: true })
  signedAt!: string | null;

  @Field(() => String, { nullable: true })
  signatureProvider!: string | null;

  @Field(() => String, { nullable: true })
  externalEnvelopeId!: string | null;
}
