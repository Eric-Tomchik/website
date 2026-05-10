import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Document',
  robots: { index: false, follow: false },
};

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
