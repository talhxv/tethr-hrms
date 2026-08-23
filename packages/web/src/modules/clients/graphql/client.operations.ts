import { gql } from '@apollo/client';

export const CLIENTS_QUERY = gql`
  query Clients {
    clients {
      id
      name
      createdAt
      workspaces {
        id
        displayName
        defaultCurrency
        defaultLocale
        createdAt
      }
    }
  }
`;

export const ONBOARD_CLIENT_MUTATION = gql`
  mutation OnboardClient($input: OnboardClientInput!) {
    onboardClient(input: $input) {
      client {
        id
        name
        createdAt
      }
      workspace {
        id
        legalName
        displayName
        kind
        defaultLocale
        defaultCurrency
        createdAt
      }
      initialAdmin {
        id
        email
        organizationId
        status
        roleKeys
        portal
      }
      initialHrAdmin {
        id
        email
        organizationId
        status
        roleKeys
        portal
      }
    }
  }
`;
