import { gql } from '@apollo/client';

const AUTH_PAYLOAD = `
  token
  user {
    id
    email
    organizationId
    status
    employeeId
    roleKeys
    portal
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ${AUTH_PAYLOAD}
    }
  }
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      ${AUTH_PAYLOAD}
    }
  }
`;

export const WORKSPACE_USERS_QUERY = gql`
  query WorkspaceUsers {
    workspaceUsers {
      id
      email
      organizationId
      status
      employeeId
      roleKeys
      portal
    }
  }
`;

export const ASSIGNABLE_WORKSPACE_ROLES_QUERY = gql`
  query AssignableWorkspaceRoles {
    assignableWorkspaceRoles
  }
`;

export const CREATE_WORKSPACE_USER_MUTATION = gql`
  mutation CreateWorkspaceUser($input: CreateWorkspaceUserInput!) {
    createWorkspaceUser(input: $input) {
      id
      email
      organizationId
      status
      employeeId
      roleKeys
      portal
    }
  }
`;

export const UPDATE_WORKSPACE_USER_ROLE_MUTATION = gql`
  mutation UpdateWorkspaceUserRole($input: UpdateWorkspaceUserRoleInput!) {
    updateWorkspaceUserRole(input: $input) {
      id
      email
      organizationId
      status
      employeeId
      roleKeys
      portal
    }
  }
`;
