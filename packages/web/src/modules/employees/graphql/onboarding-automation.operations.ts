import { gql } from '@apollo/client';

const ONBOARDING_AUTOMATION_RUN_FIELDS = gql`
  fragment OnboardingAutomationRunFields on OnboardingAutomationRun {
    id
    employeeId
    stage
    status
    resultStage
    documentUrl
    message
    responseStatus
    createdAt
    deliveredAt
    completedAt
  }
`;

export const EMPLOYEE_ONBOARDING_AUTOMATION_QUERY = gql`
  ${ONBOARDING_AUTOMATION_RUN_FIELDS}
  query EmployeeOnboardingAutomation($employeeId: ID!) {
    employeeOnboardingStage(employeeId: $employeeId) {
      employeeId
      stage
      documentsFolderUrl
      updatedAt
    }
    onboardingAutomationRuns(employeeId: $employeeId) {
      ...OnboardingAutomationRunFields
    }
  }
`;

export const SET_EMPLOYEE_ONBOARDING_STAGE_MUTATION = gql`
  mutation SetEmployeeOnboardingStage($input: SetEmployeeOnboardingStageInput!) {
    setEmployeeOnboardingStage(input: $input) {
      employeeId
      stage
      documentsFolderUrl
      updatedAt
    }
  }
`;

export const RUN_ONBOARDING_AUTOMATION_MUTATION = gql`
  ${ONBOARDING_AUTOMATION_RUN_FIELDS}
  mutation RunOnboardingAutomation($employeeId: ID!) {
    runOnboardingAutomation(employeeId: $employeeId) {
      ...OnboardingAutomationRunFields
    }
  }
`;

export const ONBOARDING_AUTOMATION_SETTINGS_QUERY = gql`
  query OnboardingAutomationSettings {
    onboardingAutomationSettings {
      webhookUrl
      enabled
      secretConfigured
      callbackPath
      ready
    }
  }
`;

export const UPDATE_ONBOARDING_AUTOMATION_SETTINGS_MUTATION = gql`
  mutation UpdateOnboardingAutomationSettings($input: UpdateOnboardingAutomationSettingsInput!) {
    updateOnboardingAutomationSettings(input: $input) {
      webhookUrl
      enabled
      secretConfigured
      callbackPath
      ready
    }
  }
`;
