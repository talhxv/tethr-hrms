import { gql } from '@apollo/client';

export const LEAVE_TRIAGE_QUERY = gql`
  query LeaveTriage {
    employees {
      id
      employeeNumber
      firstName
      lastName
    }
    leaveTypes {
      id
      name
      code
    }
    leaveRequestInbox {
      id
      employeeId
      leaveTypeId
      startDate
      endDate
      dayCount
      status
      reason
      submittedAt
      decidedAt
      decidedByUserId
      decisionNote
    }
  }
`;

export const APPROVE_TEAM_LEAVE_REQUEST_MUTATION = gql`
  mutation ApproveTeamLeaveRequest($input: ReviewLeaveRequestInput!) {
    approveTeamLeaveRequest(input: $input) {
      id
      status
      reason
      submittedAt
      decidedAt
      decidedByUserId
      decisionNote
    }
  }
`;

export const REJECT_TEAM_LEAVE_REQUEST_MUTATION = gql`
  mutation RejectTeamLeaveRequest($input: ReviewLeaveRequestInput!) {
    rejectTeamLeaveRequest(input: $input) {
      id
      status
      reason
      submittedAt
      decidedAt
      decidedByUserId
      decisionNote
    }
  }
`;
