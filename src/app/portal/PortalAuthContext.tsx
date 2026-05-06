'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface ClientUser {
  _id: Id<'clients'>;
  name: string;
  email: string;
  company?: string;
  avatar_url?: string;
}

interface PortalAuthContextType {
  client: ClientUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType>({
  client: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('portal_token');
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('portal_token', token);
  } else {
    localStorage.removeItem('portal_token');
  }
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.clients.login);
  const logoutMutation = useMutation(api.clients.logout);

  // Read token on mount
  useEffect(() => {
    const t = getToken();
    setTokenState(t);
    if (!t) setIsLoading(false);
  }, []);

  // Validate session
  const validatedClient = useQuery(
    api.clients.validateSession,
    token ? { token } : 'skip'
  );

  useEffect(() => {
    if (token && validatedClient !== undefined) {
      setIsLoading(false);
      if (validatedClient === null) {
        // Session expired
        setToken(null);
        setTokenState(null);
      }
    }
  }, [token, validatedClient]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    setToken(result.token);
    setTokenState(result.token);
  }, [loginMutation]);

  const logout = useCallback(async () => {
    if (token) {
      try { await logoutMutation({ token }); } catch {}
    }
    setToken(null);
    setTokenState(null);
  }, [token, logoutMutation]);

  return (
    <PortalAuthContext.Provider
      value={{
        client: (validatedClient as ClientUser) ?? null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}
