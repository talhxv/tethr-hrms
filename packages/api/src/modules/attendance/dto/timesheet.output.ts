import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Timesheet')
export class TimesheetView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  periodStart!: string;

  @Field()
  periodEnd!: string;

  @Field()
  status!: string;

  @Field(() => Float)
  totalHours!: number;
}
