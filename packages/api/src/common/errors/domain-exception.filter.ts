import type { DomainErrorCode } from '@hrms/shared';
import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { GqlArgumentsHost, type GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { DomainError } from './domain-error';


const HTTP_STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  TENANT_CONTEXT_MISSING: 400,
  IMMUTABLE_RECORD: 409,
  EFFECTIVE_DATE_OVERLAP: 409,
  INTERNAL_ERROR: 500,
};

// Minimal shape of the HTTP response — avoids depending on express types here.
type HttpResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
};

// Maps a thrown DomainError to the right transport response (architecture.md §6.5):
// a GraphQLError with a `code` extension for GraphQL, a JSON body for REST.
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const status = HTTP_STATUS_BY_CODE[exception.code] ?? 500;

    if (host.getType<GqlContextType>() === 'graphql') {
      // Rethrow as a GraphQLError; the GraphQL execution layer surfaces it with
      // a machine-readable `code` the client can switch on.
      void GqlArgumentsHost.create(host);
      throw new GraphQLError(exception.message, {
        extensions: { code: exception.code, status, details: exception.details ?? null },
      });
    }

    const response = host.switchToHttp().getResponse<HttpResponseLike>();
    response.status(status).json(exception.serialize());
  }
}
