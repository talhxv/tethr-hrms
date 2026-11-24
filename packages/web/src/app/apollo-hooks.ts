import {
  useQuery as useApolloQuery,
  type DocumentNode,
  type OperationVariables,
  type QueryHookOptions,
  type QueryResult,
  type TypedDocumentNode,
} from '@apollo/client';

// Screens show cached data straight away and refresh it in the background: the
// client default is `cache-and-network` (see apollo-client.ts). Apollo reports
// `loading` during that background refresh too, which would flash a skeleton
// over data already on screen. Here `loading` means "nothing to show yet", so
// a revisited screen renders instantly and quietly updates. Use this hook, not
// Apollo's, for screen queries.
export const useQuery = <TData, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
): QueryResult<TData, TVariables> => {
  const result = useApolloQuery<TData, TVariables>(query, options);
  return { ...result, loading: result.loading && result.data === undefined };
};
