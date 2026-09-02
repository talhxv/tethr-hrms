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

  @Field(() => String, { nullable: true })
  permanentAddressLine1!: string | null;

  @Field(() => String, { nullable: true })
  permanentAddressLine2!: string | null;

  @Field(() => String, { nullable: true })
  permanentCity!: string | null;

  @Field(() => String, { nullable: true })
  permanentRegion!: string | null;

  @Field(() => String, { nullable: true })
  permanentCountryCode!: string | null;

  @Field(() => String, { nullable: true })
  permanentPostalCode!: string | null;

  @Field(() => String, { nullable: true })
  currentAccommodationType!: string | null;

  @Field(() => String, { nullable: true })
  permanentAccommodationType!: string | null;

  @Field(() => String, { nullable: true })
  preferredContactChannel!: string | null;

  @Field(() => String, { nullable: true })
  emergencyContactName!: string | null;

  @Field(() => String, { nullable: true })
  emergencyContactPhone!: string | null;

  @Field(() => String, { nullable: true })
  emergencyContactRelation!: string | null;
}
