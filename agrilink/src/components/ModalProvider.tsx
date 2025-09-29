"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';

type ConfirmOptions = {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
};

type ModalContextType = {
  alert: (message: string) => Promise<void>;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<{ message: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    opts: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const alert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setAlertState({ message });
      const onClose = () => {
        setAlertState(null);
        resolve();
      };
      // attach to window for simple access inside the component
      (window as any).__closeAlert = onClose;
    });
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ opts, resolve });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}

      {/* Simple Alert Modal */}
      {alertState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
            <div className="mb-4 text-gray-800">{alertState.message}</div>
            <div className="text-right">
              <button
                onClick={() => {
                  setAlertState(null);
                  if ((window as any).__closeAlert) (window as any).__closeAlert();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
            {confirmState.opts.title && <h3 className="text-lg font-semibold mb-2">{confirmState.opts.title}</h3>}
            <div className="mb-4 text-gray-800">{confirmState.opts.message}</div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="px-4 py-2 border rounded"
              >
                {confirmState.opts.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {confirmState.opts.okText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
