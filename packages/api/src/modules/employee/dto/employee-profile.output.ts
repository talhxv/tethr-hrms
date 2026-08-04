import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeProfile')
export class EmployeeProfileView {
  @Field(() => ID)
  employeeId!: string;

  @Field(() => String, { nullable: true })
  photoUrl!: string | null;

  @Field(() => String, { nullable: true })
  personalEmail!: string | null;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String, { nullable: true })
  addressLine1!: string | null;

  @Field(() => String, { nullable: true })
  addressLine2!: string | null;

  @Field(() => String, { nullable: true })
  city!: string | null;

  @Field(() => String, { nullable: true })
  region!: string | null;

  @Field(() => String, { nullable: true })
  countryCode!: string | null;

  @Field(() => String, { nullable: true })
  postalCode!: string | null;
}
