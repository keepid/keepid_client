import React, { createContext, useContext } from 'react';

type RequestSubmitFn = () => void;

const WizardSubmitContext = createContext<RequestSubmitFn | null>(null);
const RestoredFormContext = createContext<boolean>(false);

export function WizardSubmitProvider({
  requestSubmit,
  children,
  startAtLastStep = false,
}: {
  requestSubmit: () => void;
  children: React.ReactNode;
  startAtLastStep?: boolean;
}) {
  return (
    <WizardSubmitContext.Provider value={requestSubmit}>
      <RestoredFormContext.Provider value={startAtLastStep}>
        {children}
      </RestoredFormContext.Provider>
    </WizardSubmitContext.Provider>
  );
}

export function useWizardSubmit(): RequestSubmitFn | null {
  return useContext(WizardSubmitContext);
}

export function useRestoredForm(): boolean {
  return useContext(RestoredFormContext);
}
