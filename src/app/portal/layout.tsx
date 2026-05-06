import { PortalAuthProvider } from './PortalAuthContext';

export const metadata = {
  title: 'Client Portal — Eric Tomchik',
  description: 'Access your projects, submit support tickets, and communicate with Eric.',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalAuthProvider>{children}</PortalAuthProvider>;
}
