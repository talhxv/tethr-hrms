import { gql } from '@apollo/client';

export const ANNOUNCEMENTS_QUERY = gql`
  query Announcements {
    announcements {
      id
      title
      body
      audience
      isPinned
      publishedAt
      expiresAt
    }
  }
`;

export const PUBLISH_ANNOUNCEMENT_MUTATION = gql`
  mutation PublishAnnouncement($input: PublishAnnouncementInput!) {
    publishAnnouncement(input: $input) {
      id
      title
      body
      audience
      isPinned
      publishedAt
      expiresAt
    }
  }
`;

export const SUBMIT_MY_FEEDBACK_MUTATION = gql`
  mutation SubmitMyFeedback($input: SubmitMyFeedbackInput!) {
    submitMyFeedback(input: $input) {
      id
      category
      subject
      body
      status
      createdAt
      updatedAt
    }
  }
`;

export const FEEDBACK_INBOX_QUERY = gql`
  query EmployeeFeedback {
    employeeFeedback {
      id
      employeeId
      category
      subject
      body
      status
      resolutionNote
      createdAt
      updatedAt
    }
  }
`;

export const RESOLVE_FEEDBACK_MUTATION = gql`
  mutation ResolveEmployeeFeedback($input: ResolveFeedbackInput!) {
    resolveEmployeeFeedback(input: $input) {
      id
      employeeId
      category
      subject
      body
      status
      resolutionNote
      createdAt
      updatedAt
    }
  }
`;
