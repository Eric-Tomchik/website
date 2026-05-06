'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BookForCheckout {
  _id: string;
  title: string;
  description: string;
  price_cents: number;
  digital_price_cents?: number;
  cover_image_url?: string;
}

interface CheckoutState {
  isOpen: boolean;
  book: BookForCheckout | null;
  format: 'physical' | 'digital';
}

interface CheckoutContextType {
  state: CheckoutState;
  openCheckout: (book: BookForCheckout, format: 'physical' | 'digital') => void;
  closeCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    isOpen: false,
    book: null,
    format: 'physical',
  });

  const openCheckout = useCallback((book: BookForCheckout, format: 'physical' | 'digital') => {
    setState({ isOpen: true, book, format });
  }, []);

  const closeCheckout = useCallback(() => {
    setState({ isOpen: false, book: null, format: 'physical' });
  }, []);

  return (
    <CheckoutContext.Provider value={{ state, openCheckout, closeCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
