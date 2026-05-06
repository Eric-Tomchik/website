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

// Use httpOnly cookie via API route instead of localStorage
async function getTokenFromCookie(): Promise<string | null> {
  try {
    const res = await fetch('/api/portal/session');
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
}

async function setTokenCookie(token: string | null): Promise<void> {
  try {
    if (token) {
      await fetch('/api/portal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } else {
      await fetch('/api/portal/session', { method: 'DELETE' });
    }
  } catch {
    // Silently fail — cookie operations are best-effort
  }
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.clients.login);
  const logoutMutation = useMutation(api.clients.logout);

  // Read token from httpOnly cookie on mount
  useEffect(() => {
    getTokenFromCookie().then((t) => {
      setTokenState(t);
      if (!t) setIsLoading(false);
    });
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
        setTokenCookie(null);
        setTokenState(null);
      }
    }
  }, [token, validatedClient]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    await setTokenCookie(result.token);
    setTokenState(result.token);
  }, [loginMutation]);

  const logout = useCallback(async () => {
    if (token) {
      try { await logoutMutation({ token }); } catch {}
    }
    await setTokenCookie(null);
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
