import { gql } from '@apollo/client';

const EMPLOYEE_FIELDS = `
  id
  employeeNumber
  firstName
  lastName
  workEmail
  roleTitle
  dateOfBirth
  hireDate
  probationEndDate
  employmentStatus
  workerType
`;

export const EMPLOYEES_QUERY = gql`
  query Employees {
    employees {
      ${EMPLOYEE_FIELDS}
    }
  }
`;

export const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      ${EMPLOYEE_FIELDS}
    }
  }
`;

export const EMPLOYEE_DETAIL_QUERY = gql`
  query EmployeeDetail($employeeId: ID!, $asOf: String!) {
    employee(id: $employeeId) {
      ${EMPLOYEE_FIELDS}
    }
    employeeProfile(employeeId: $employeeId) {
      employeeId
      photoUrl
      personalEmail
      phone
      city
      region
      countryCode
    }
    currentSalaryRevision(employeeId: $employeeId, asOf: $asOf) {
      id
      salaryStructureId
      currency
      annualAmount
      validFrom
      validTo
      reason
    }
    employeeAssessments(employeeId: $employeeId) {
      id
      title
      assessmentDate
      score
      assessorName
      notes
    }
    employeeDocuments(employeeId: $employeeId) {
      id
      documentId
      category
      visibility
      name
      contentType
      sizeBytes
      classification
      latestStorageKey
      latestVersionNumber
      versionCount
      signatureStatus
      signedAt
      signatureProvider
      externalEnvelopeId
    }
    bonusAwards(employeeId: $employeeId) {
      id
      awardDate
      currency
      amount
      reason
      note
    }
  }
`;

export const EMPLOYEE_SALARY_STRUCTURES_QUERY = gql`
  query EmployeeSalaryStructures {
    salaryStructures {
      id
      name
      code
      currency
      payFrequency
      isActive
    }
  }
`;

export const RECORD_EMPLOYEE_ASSESSMENT_MUTATION = gql`
  mutation RecordEmployeeAssessment($input: RecordEmployeeAssessmentInput!) {
    recordEmployeeAssessment(input: $input) {
      id
      title
      assessmentDate
      score
      assessorName
      notes
    }
  }
`;

export const ATTACH_EMPLOYEE_DOCUMENT_MUTATION = gql`
  mutation AttachEmployeeDocument($input: AttachEmployeeDocumentInput!) {
    attachEmployeeDocument(input: $input) {
      id
      documentId
      category
      visibility
      name
      contentType
      sizeBytes
      classification
      latestStorageKey
      latestVersionNumber
      versionCount
      signatureStatus
      signedAt
      signatureProvider
      externalEnvelopeId
    }
  }
`;

export const ADD_EMPLOYEE_DOCUMENT_VERSION_MUTATION = gql`
  mutation AddEmployeeDocumentVersion($input: AddEmployeeDocumentVersionInput!) {
    addEmployeeDocumentVersion(input: $input) {
      id
      documentId
      category
      visibility
      name
      contentType
      sizeBytes
      classification
      latestStorageKey
      latestVersionNumber
      versionCount
      signatureStatus
      signedAt
      signatureProvider
      externalEnvelopeId
    }
  }
`;

export const PREPARE_EMPLOYEE_DOCUMENT_UPLOAD_MUTATION = gql`
  mutation PrepareEmployeeDocumentUpload($input: PrepareEmployeeDocumentUploadInput!) {
    prepareEmployeeDocumentUpload(input: $input) {
      storageKey
      url
      method
      expiresAt
      headers {
        name
        value
      }
    }
  }
`;

export const EMPLOYEE_DOCUMENT_DOWNLOAD_ACCESS_QUERY = gql`
  query EmployeeDocumentDownloadAccess($employeeDocumentLinkId: ID!) {
    employeeDocumentDownloadAccess(employeeDocumentLinkId: $employeeDocumentLinkId) {
      storageKey
      url
      method
      expiresAt
      headers {
        name
        value
      }
    }
  }
`;

export const REQUEST_EMPLOYEE_DOCUMENT_SIGNATURE_MUTATION = gql`
  mutation RequestEmployeeDocumentSignature($input: RequestEmployeeDocumentSignatureInput!) {
    requestEmployeeDocumentSignature(input: $input) {
      employeeDocumentLinkId
      documentId
      signingUrl
      externalEnvelopeId
      signatureProvider
      signatureStatus
      expiresAt
    }
  }
`;

export const AWARD_BONUS_MUTATION = gql`
  mutation AwardBonus($input: AwardBonusInput!) {
    awardBonus(input: $input) {
      id
      awardDate
      currency
      amount
      reason
      note
    }
  }
`;

export const REVISE_EMPLOYEE_SALARY_MUTATION = gql`
  mutation ReviseEmployeeSalary($input: ReviseSalaryInput!) {
    reviseSalary(input: $input) {
      id
      employeeId
      salaryStructureId
      validFrom
      validTo
      currency
      annualAmount
      reason
      approvedByUserId
      note
    }
  }
`;

export const EMPLOYEE_HR_RECORD_QUERY = gql`
  query EmployeeHrRecord($employeeId: ID!) {
    employeeHrRecord(employeeId: $employeeId) {
      id
      employeeId
      roleTitle
      salaryBreakdown
      bankName
      bankAccountTitle
      bankAccountNumber
      bankIban
      hardwareInfo
      employeeRecordForm
    }
  }
`;

export const EMPLOYEE_ONBOARDING_TASKS_QUERY = gql`
  query EmployeeOnboardingTasks($employeeId: ID!) {
    employeeOnboardingTasks(employeeId: $employeeId) {
      id
      employeeId
      taskKey
      title
      status
      dueDate
      completedAt
      notes
    }
  }
`;

export const UPDATE_EMPLOYEE_HR_RECORD_MUTATION = gql`
  mutation UpdateEmployeeHrRecord($input: UpdateEmployeeHrRecordInput!) {
    updateEmployeeHrRecord(input: $input) {
      id
      employeeId
      roleTitle
      salaryBreakdown
      bankName
      bankAccountTitle
      bankAccountNumber
      bankIban
      hardwareInfo
      employeeRecordForm
    }
  }
`;

export const UPDATE_EMPLOYEE_ONBOARDING_TASK_MUTATION = gql`
  mutation UpdateEmployeeOnboardingTask($input: UpdateEmployeeOnboardingTaskInput!) {
    updateEmployeeOnboardingTask(input: $input) {
      id
      employeeId
      taskKey
      title
      status
      dueDate
      completedAt
      notes
    }
  }
`;
