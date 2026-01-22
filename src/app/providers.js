'use client';

import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient'; 

export function Providers({ children }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}