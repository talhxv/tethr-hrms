import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { portalHome } from '../../../app/portal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isBusy } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    try {
      const session = await login(email, password);
      navigate(portalHome(session.user.portal), { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign in failed');
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace.</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="login-email">Work email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="button button-primary button-full" type="submit" disabled={isBusy}>
          {isBusy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-switch">
          No account yet? <Link to="/signup">Create your workspace</Link>
        </p>
      </form>
    </div>
  );
};
