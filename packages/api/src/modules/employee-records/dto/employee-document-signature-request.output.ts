import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeDocumentSignatureRequest')
export class EmployeeDocumentSignatureRequestView {
  @Field(() => ID)
  employeeDocumentLinkId!: string;

  @Field(() => ID)
  documentId!: string;

  @Field()
  signingUrl!: string;

  @Field()
  externalEnvelopeId!: string;

  @Field()
  signatureProvider!: string;

  @Field()
  signatureStatus!: string;

  @Field()
  expiresAt!: string;
}
