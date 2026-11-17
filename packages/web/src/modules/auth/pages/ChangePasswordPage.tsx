import { useMutation } from '@apollo/client';
import { useAtom } from 'jotai';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { CHANGE_MY_PASSWORD_MUTATION } from '../graphql/auth.operations';
import { useAuth } from '../hooks/useAuth';
import { authState } from '../states/authState';

// Matches MIN_OWN_PASSWORD_LENGTH in the API (AuthService); the API is the
// authority and returns the same rule if this drifts.
const MIN_PASSWORD_LENGTH = 10;

type ChangeMyPasswordVars = {
  input: { currentPassword: string; newPassword: string };
};
type ChangeMyPasswordData = {
  changeMyPassword: { readonly id: string; readonly mustChangePassword: boolean };
};

// Two entry points: forced after signing in with an administrator-issued
// password (RequireAuth sends people here), or chosen from the account menu.
export const ChangePasswordPage = () => {
  const [session, setSession] = useAtom(authState);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [changePassword, { loading }] = useMutation<ChangeMyPasswordData, ChangeMyPasswordVars>(
    CHANGE_MY_PASSWORD_MUTATION,
  );

  if (!session) return <Navigate to="/login" replace />;
  const forced = Boolean(session.user.mustChangePassword);
  const from = (location.state as { from?: string } | null)?.from;
  const destination = from && from !== '/change-password' ? from : '/';

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The two new passwords don’t match.');
      return;
    }
    try {
      await changePassword({ variables: { input: { currentPassword, newPassword } } });
      setSession({ ...session, user: { ...session.user, mustChangePassword: false } });
      navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not change your password');
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={(event) => void onSubmit(event)}>
        <h1 className="auth-title">{forced ? 'Set your password' : 'Change password'}</h1>
        <p className="auth-subtitle">
          {forced
            ? 'You signed in with a temporary password from your administrator. Choose your own to continue.'
            : `Signed in as ${session.user.email}.`}
        </p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="change-password-current">
            {forced ? 'Temporary password' : 'Current password'}
          </label>
          <input
            id="change-password-current"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="change-password-new">New password</label>
          <input
            id="change-password-new"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            aria-describedby="change-password-hint"
            minLength={MIN_PASSWORD_LENGTH}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <p className="field-hint" id="change-password-hint">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>
        <div className="field">
          <label htmlFor="change-password-confirm">Confirm new password</label>
          <input
            id="change-password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        <button className="button button-primary button-full" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save password'}
        </button>
        <p className="auth-switch">
          {forced ? (
            <Link onClick={() => void logout()} to="/login">
              Sign out
            </Link>
          ) : (
            <Link to={destination}>Cancel</Link>
          )}
        </p>
      </form>
    </div>
  );
};
