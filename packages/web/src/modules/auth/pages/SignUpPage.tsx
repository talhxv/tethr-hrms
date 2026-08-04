import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { portalHome } from '../../../app/portal';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, isBusy } = useAuth();
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Work email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
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
