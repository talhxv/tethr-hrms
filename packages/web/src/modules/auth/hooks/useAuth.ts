import { useApolloClient, useMutation } from '@apollo/client';
import { useAtom } from 'jotai';

import { LOGIN_MUTATION, SIGN_UP_MUTATION } from '../graphql/auth.operations';
import { authState, type AuthSession } from '../states/authState';

type LoginVars = { input: { email: string; password: string } };
type LoginData = { login: AuthSession };
type SignUpVars = { input: { organizationName: string; email: string; password: string } };
type SignUpData = { signUp: AuthSession };

export const useAuth = () => {
  const [session, setSession] = useAtom(authState);
  const apollo = useApolloClient();
  const [loginMutation, { loading: loggingIn }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);
  const [signUpMutation, { loading: signingUp }] = useMutation<SignUpData, SignUpVars>(
    SIGN_UP_MUTATION,
  );

  const login = async (email: string, password: string): Promise<AuthSession> => {
    const { data } = await loginMutation({ variables: { input: { email, password } } });
    if (data) {
      setSession(data.login);
      return data.login;
    }
    throw new Error('Sign in did not return a session');
  };

  const signUp = async (
    organizationName: string,
    email: string,
    password: string,
  ): Promise<AuthSession> => {
    const { data } = await signUpMutation({
      variables: { input: { organizationName, email, password } },
    });
    if (data) {
      setSession(data.signUp);
      return data.signUp;
    }
    throw new Error('Sign up did not return a session');
  };

  const logout = async (): Promise<void> => {
    setSession(null);
    await apollo.clearStore();
  };

  return {
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token),
    isBusy: loggingIn || signingUp,
    login,
    signUp,
    logout,
  };
};
