import React, { createContext, useContext } from 'react';

type RequestSubmitFn = () => void;

const WizardSubmitContext = createContext<RequestSubmitFn | null>(null);
const WizardBackContext = createContext<(() => void) | null>(null);
const RestoredFormContext = createContext<boolean>(false);

export function WizardSubmitProvider({
  requestSubmit,
  onBack,
  children,
  startAtLastStep = false,
}: {
  requestSubmit: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  startAtLastStep?: boolean;
}) {
  return (
    <WizardSubmitContext.Provider value={requestSubmit}>
      <WizardBackContext.Provider value={onBack ?? null}>
        <RestoredFormContext.Provider value={startAtLastStep}>
          {children}
        </RestoredFormContext.Provider>
      </WizardBackContext.Provider>
    </WizardSubmitContext.Provider>
  );
}

export function useWizardSubmit(): RequestSubmitFn | null {
  return useContext(WizardSubmitContext);
}

export function useWizardBack(): (() => void) | null {
  return useContext(WizardBackContext);
}

export function useRestoredForm(): boolean {
  return useContext(RestoredFormContext);
}
