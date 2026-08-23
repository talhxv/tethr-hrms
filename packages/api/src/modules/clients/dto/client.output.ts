import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { Client } from '../entities/client.entity';

@ObjectType('Client')
export class ClientView {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: string;
}

export const toClientView = (client: Client): ClientView => ({
  id: client.id,
  name: client.name,
  createdAt: client.createdAt.toISOString(),
});
