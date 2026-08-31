import { gql } from '@apollo/client';

export const MY_WORKSPACE_QUERY = gql`
  query MyWorkspace($asOf: String!, $from: String!, $to: String!) {
    myEmployee {
      id
      employeeNumber
      firstName
      lastName
      workEmail
      dateOfBirth
      hireDate
      probationEndDate
      employmentStatus
      workerType
    }
    myEmployeeProfile {
      employeeId
      photoUrl
      personalEmail
      phone
      addressLine1
      addressLine2
      city
      region
      countryCode
      postalCode
    }
    leaveTypes {
      id
      name
      code
      unit
      paid
      requiresApproval
      defaultAnnualEntitlement
    }
    myLeaveBalances {
      id
      leaveTypeId
      periodYear
      entitledDays
      usedDays
      pendingDays
      availableDays
    }
    myLeaveRequests {
      id
      leaveTypeId
      startDate
      endDate
      dayCount
      status
      reason
      submittedAt
      decidedAt
      decisionNote
    }
    upcomingHolidays(from: $from, to: $to) {
      id
      date
      name
    }
    myCurrentSalaryRevision(asOf: $asOf) {
      id
      currency
      annualAmount
      validFrom
      validTo
      reason
    }
  }
`;

export const SUBMIT_MY_LEAVE_REQUEST_MUTATION = gql`
  mutation SubmitMyLeaveRequest($input: SubmitMyLeaveRequestInput!) {
    submitMyLeaveRequest(input: $input) {
      id
      leaveTypeId
      startDate
      endDate
      dayCount
      status
      reason
      submittedAt
      decidedAt
      decisionNote
    }
  }
`;

export const UPDATE_MY_EMPLOYEE_PROFILE_MUTATION = gql`
  mutation UpdateMyEmployeeProfile($input: UpdateMyProfileInput!) {
    updateMyEmployeeProfile(input: $input) {
      employeeId
      photoUrl
      personalEmail
      phone
      addressLine1
      addressLine2
      city
      region
      countryCode
      postalCode
    }
  }
`;

export const UPDATE_MY_EMPLOYEE_PHOTO_MUTATION = gql`
  mutation UpdateMyEmployeePhoto($input: UpdateMyPhotoInput!) {
    updateMyEmployeePhoto(input: $input) {
      employeeId
      photoUrl
    }
  }
`;
