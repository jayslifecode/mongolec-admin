import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { sidebarData } from "@/components/layout/data/sidebar-data";
import { tenantForPath } from "@/lib/navigation";

// Modern HTTP link for Apollo Client v4
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  credentials: "include", // Include cookies in requests
});

// Modern error handling for Apollo Client v4
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    // Handle GraphQL errors
    error.errors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  } else if (error) {
    // Handle network/other errors
    console.error(`[Network error]: ${error.message}`, {
      operation: operation.operationName,
    });
  }

  // Note: Auth error handling is managed by AuthProvider context
});

// Pages of an organisation's section (e.g. Rally for Rangers) work in that organisation:
// super admins belong to Mongolec, so without this header their rally lists come back empty
// and new rallies are filed under Mongolec. The backend ignores it for anyone else.
const tenantLink = new ApolloLink((operation, forward) => {
  const tenant =
    typeof window === "undefined"
      ? null
      : tenantForPath(window.location.pathname, sidebarData.navGroups);
  if (tenant) {
    operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: { ...headers, "X-Tenant-ID": tenant },
    }));
  }
  return forward(operation);
});

// Chain links using ApolloLink.from (modern v4 approach)
const link = ApolloLink.from([errorLink, tenantLink, httpLink]);

// Create Apollo Client with secure cookie-based auth (v4)
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all", // Return partial data and errors
    },
    query: {
      errorPolicy: "all",
    },
  },
});
