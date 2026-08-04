import { gql } from '@apollo/client';

export const HIRING_REQUESTS_QUERY = gql`
  query HiringRequests {
    hiringRequests {
      id
      positionTitle
      headcount
      employmentType
      location
      preferredStartDate
      clientNote
      tethrNote
      status
      createdAt
      updatedAt
      updates {
        id
        hiringRequestId
        status
        actor
        note
        createdByUserId
        createdAt
      }
    }
  }
`;

export const CREATE_HIRING_REQUEST_MUTATION = gql`
  mutation CreateHiringRequest($input: CreateHiringRequestInput!) {
    createHiringRequest(input: $input) {
      id
      status
    }
  }
`;

export const UPDATE_HIRING_REQUEST_MUTATION = gql`
  mutation UpdateHiringRequest($input: UpdateHiringRequestInput!) {
    updateHiringRequest(input: $input) {
      id
      status
      tethrNote
      updatedAt
    }
  }
`;
