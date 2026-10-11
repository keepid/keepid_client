/**
 * What the application wizard shows when the PDF cannot be generated or saved. Server and PDF-tool messages can
 * name internals (for example a missing LibreOffice), so they are kept out of the main message.
 */
export const WIZARD_SUBMIT_FAILURE_MESSAGE =
  "We couldn't generate the application right now. Your answers are saved on this page. Try again.";

export interface WizardSubmitFailure {
  /** Friendly message for the user. */
  message: string;
  /** Technical detail for the collapsed section. */
  detail: string;
}

export function describeWizardSubmitFailure(err: unknown): WizardSubmitFailure {
  const detail = err instanceof Error ? err.message.trim() : String(err ?? '').trim();
  return { message: WIZARD_SUBMIT_FAILURE_MESSAGE, detail: detail || 'Unknown error' };
}
