import {
  fillPdfBlob,
  listApplicationPdfIds,
  updateProfileFromDirectives,
  uploadCompletedPdf,
} from './api/interactiveForm';
import { createClassifiedService } from './applicationSelector/flowApi';
import type { SelectorCompletionContext } from './applicationSelector/types';

export interface SubmitWizardFillInput {
  /** Registry entry id the PDF is filled from. */
  blankFormId: string;
  clientUsername: string;
  /** Existing service record / application the form is being saved into, if any. */
  serviceRecordId?: string | null;
  /** Set on the picker route: the classified service is created on first save. */
  selectorCompletion?: SelectorCompletionContext;
  pdfFill: Record<string, unknown>;
  formOutput: Record<string, unknown>;
  profileUpdates: Record<string, unknown>;
  directiveValues: Record<string, unknown>;
}

export interface SubmitWizardFillResult {
  blob: Blob;
  persistedId: string;
}

/**
 * Fill the PDF, save it as an application, and push directive answers back to the profile.
 * ApplicationForm.handleWizardSubmit wraps this with UI state. The application-fill regression
 * check in keepid_server_next also calls it, so keep it free of React and UI state.
 */
export async function submitWizardFill({
  blankFormId,
  clientUsername,
  serviceRecordId,
  selectorCompletion,
  pdfFill,
  formOutput,
  profileUpdates,
  directiveValues,
}: SubmitWizardFillInput): Promise<SubmitWizardFillResult> {
  let existingApplicationIdsBeforeSave: Set<string> | null = null;
  try {
    existingApplicationIdsBeforeSave = new Set(await listApplicationPdfIds(clientUsername));
  } catch {
    existingApplicationIdsBeforeSave = null;
  }
  const blob = await fillPdfBlob(blankFormId, pdfFill, clientUsername);
  let applicationId = serviceRecordId;
  if (!applicationId && selectorCompletion) {
    const created = await createClassifiedService({
      clientUsername,
      ...selectorCompletion,
      directiveValues,
    });
    applicationId = created.applicationId;
  }
  const uploadResult = await uploadCompletedPdf(
    blob,
    applicationId || blankFormId,
    formOutput,
    clientUsername,
    profileUpdates,
  );
  let persistedId = uploadResult.applicationId || uploadResult.fileId;
  if (!persistedId && existingApplicationIdsBeforeSave) {
    const applicationIdsAfterSave = await listApplicationPdfIds(clientUsername);
    const newlyCreatedApplicationIds = applicationIdsAfterSave.filter(
      (id) => !existingApplicationIdsBeforeSave?.has(id),
    );
    if (newlyCreatedApplicationIds.length === 1) {
      persistedId = newlyCreatedApplicationIds[0];
    }
  }
  if (!persistedId) {
    throw new Error('Could not create a persisted application record. Please try again.');
  }
  if (profileUpdates && Object.keys(profileUpdates).length > 0) {
    try {
      await updateProfileFromDirectives(profileUpdates, clientUsername);
    } catch (updateErr) {
      console.warn('Failed to update profile from form directives in background', updateErr);
    }
  }
  return { blob, persistedId };
}
