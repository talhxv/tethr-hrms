import { ApolloProvider } from '@apollo/client';
import { Provider as JotaiProvider } from 'jotai';

import { ThemeProvider } from '../providers/theme/ThemeProvider';

import { apolloClient } from './apollo-client';
import { AppRouter } from './router';

// Composition root: server cache, global atom store, theme, routing.
export const App = () => (
  <JotaiProvider>
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </ApolloProvider>
  </JotaiProvider>
);
