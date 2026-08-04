import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { AUTH_STORAGE_KEY } from '../modules/auth/states/authState';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql',
});

// Attach the bearer token (if signed in) to every request. The token carries the
// tenant, so no `x-organization-id` header is needed once authenticated.
const authLink = setContext((_request, previousContext) => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  const token = stored ? (JSON.parse(stored) as { token?: string } | null)?.token : undefined;
  const headers = (previousContext.headers ?? {}) as Record<string, string>;
  return { headers: token ? { ...headers, authorization: `Bearer ${token}` } : headers };
});

// The GraphQL/HTTP cache. Server data lives here — never duplicated into atoms
// (architecture.md §5.2).
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
