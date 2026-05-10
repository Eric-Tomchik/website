import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Success',
  robots: { index: false, follow: false },
};

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
