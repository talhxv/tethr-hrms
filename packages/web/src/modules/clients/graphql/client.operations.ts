import { gql } from '@apollo/client';

export const CLIENT_WORKSPACES_QUERY = gql`
  query ClientWorkspaces {
    clientWorkspaces {
      id
      legalName
      displayName
      kind
      defaultLocale
      defaultCurrency
      createdAt
    }
  }
`;

export const ONBOARD_CLIENT_MUTATION = gql`
  mutation OnboardClient($input: OnboardClientInput!) {
    onboardClient(input: $input) {
      client {
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
