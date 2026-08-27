'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface ClientUser { _id: Id<'clients'>; name: string; email: string; company?: string; avatar_url?: string; }
interface PortalAuthContextType {
  client: ClientUser | null; token: string | null; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>;
}
const PortalAuthContext = createContext<PortalAuthContextType>({ client: null, token: null, isLoading: true, login: async () => {}, logout: async () => {} });
export function usePortalAuth() { return useContext(PortalAuthContext); }

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/session', { credentials: 'same-origin' })
      .then(async (res) => res.ok ? res.json() : { token: null })
      .then((data) => setToken(typeof data.token === 'string' ? data.token : null))
      .finally(() => setIsLoading(false));
  }, []);

  const validatedClient = useQuery(api.clients.validateSession, token ? { token } : 'skip');
  useEffect(() => {
    if (token && validatedClient === null) {
      fetch('/api/portal/session', { method: 'DELETE' }).catch(() => {});
      setToken(null);
    }
  }, [token, validatedClient]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/portal/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/portal/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    setToken(null);
  }, []);

  return <PortalAuthContext.Provider value={{
    client: (validatedClient as ClientUser) ?? null,
    token,
    isLoading: isLoading || (!!token && validatedClient === undefined),
    login, logout,
  }}>{children}</PortalAuthContext.Provider>;
}
