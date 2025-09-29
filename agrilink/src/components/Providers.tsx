'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ModalProvider from './ModalProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </SessionProvider>
  );
}
