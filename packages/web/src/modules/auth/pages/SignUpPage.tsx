import { useApolloClient } from '@apollo/client';
import { useState, type FocusEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { portalHome } from '../../../app/portal';
import {
  EMAIL_IS_ALREADY_REGISTERED_QUERY,
  LEGAL_NAME_IS_ALREADY_USED_QUERY,
} from '../graphql/auth.operations';
import { useAuth } from '../hooks/useAuth';

type EmailCheckData = { readonly emailIsAlreadyRegistered: boolean };
type EmailCheckVars = { readonly email: string };
type NameCheckData = { readonly legalNameIsAlreadyUsed: boolean };
type NameCheckVars = { readonly legalName: string };

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, isBusy } = useAuth();
  const apollo = useApolloClient();
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // The value each warning applies to — plain state, checked imperatively via
  // client.query() rather than a subscribed useQuery. A query fired mid-
  // lifecycle (on blur, not at mount) can race React 18 StrictMode's dev-only
  // mount/unmount/remount and never deliver its result to the "wrong" hook
  // instance; a one-off promise sidesteps that entirely.
  const [registeredEmailWarning, setRegisteredEmailWarning] = useState<string | null>(null);
  const [usedNameWarning, setUsedNameWarning] = useState<string | null>(null);

  const onEmailBlur = async (event: FocusEvent<HTMLInputElement>): Promise<void> => {
    const value = event.target.value.trim();
    if (!value || !event.target.validity.valid) return;
    try {
      const { data } = await apollo.query<EmailCheckData, EmailCheckVars>({
        query: EMAIL_IS_ALREADY_REGISTERED_QUERY,
        variables: { email: value },
        fetchPolicy: 'network-only',
      });
      setRegisteredEmailWarning(data.emailIsAlreadyRegistered ? value : null);
    } catch {
      setRegisteredEmailWarning(null);
    }
  };

  const onOrganizationNameBlur = async (event: FocusEvent<HTMLInputElement>): Promise<void> => {
    const value = event.target.value.trim();
    if (!value) return;
    try {
      const { data } = await apollo.query<NameCheckData, NameCheckVars>({
        query: LEGAL_NAME_IS_ALREADY_USED_QUERY,
        variables: { legalName: value },
        fetchPolicy: 'network-only',
      });
      setUsedNameWarning(data.legalNameIsAlreadyUsed ? value : null);
    } catch {
      setUsedNameWarning(null);
    }
  };

  const emailAlreadyRegistered =
    registeredEmailWarning !== null && registeredEmailWarning === email.trim();
  const legalNameAlreadyUsed = usedNameWarning !== null && usedNameWarning === organizationName.trim();

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    try {
      const session = await signUp(organizationName, email, password);
      navigate(portalHome(session.user.portal), { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign up failed');
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="brand-lockup" style={{ marginBottom: 'var(--hrms-space-5)' }}>
          <div className="brand-mark" aria-hidden="true">
            H
          </div>
          <div className="brand-name">HRMS</div>
        </div>
        <h1 className="auth-title">Create your workspace</h1>
        <p className="auth-subtitle">Start a new company account.</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="signup-org">Company name</label>
          <input
            id="signup-org"
            type="text"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            onBlur={onOrganizationNameBlur}
            required
          />
          {legalNameAlreadyUsed ? (
            <p className="field-hint field-hint-warning">
              A workspace named &quot;{organizationName.trim()}&quot; already exists. If that&apos;s
              you, submitting here still creates a separate, brand-new workspace with this same
              name.
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="signup-email">Work email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={onEmailBlur}
            required
          />
          {emailAlreadyRegistered ? (
            <p className="field-hint field-hint-warning">
              This email already has an account. If you&apos;re joining an existing company,{' '}
              <Link to="/login">sign in</Link> instead — submitting here creates a brand-new,
              separate workspace.
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="button button-primary button-full" type="submit" disabled={isBusy}>
          {isBusy ? 'Creating…' : 'Create workspace'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};
