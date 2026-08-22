import { gql } from '@apollo/client';

export const MY_ORGANIZATION_QUERY = gql`
  query MyOrganization {
    myOrganization {
      id
      legalName
      displayName
      brandColor
    }
  }
`;

export const UPDATE_MY_ORGANIZATION_BRAND_COLOR_MUTATION = gql`
  mutation UpdateMyOrganizationBrandColor($input: UpdateBrandColorInput!) {
    updateMyOrganizationBrandColor(input: $input) {
      id
      legalName
      displayName
      brandColor
    }
  }
`;
