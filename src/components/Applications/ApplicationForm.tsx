import '../InteractiveForms/form-preview.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import PromptOnLeave from '../BaseComponents/PromptOnLeave';
import InteractiveFormWizard from '../InteractiveForms/InteractiveFormWizard';
import SignAndDownloadViewer from '../InteractiveForms/SignAndDownloadViewer';
import type { BuilderState } from '../InteractiveForms/types';
import { enrollClient } from '../SignUp/SignUp.api';
import { birthDateStringFromIsoDateOnly, localDateFromIsoDateOnly } from '../SignUp/SignUp.util';
import {
  validateBirthdate,
  validateEmail,
  validateFirstname,
  validateLastname,
  validatePhonenumber,
} from '../SignUp/SignUp.validators';
import {
  fillPdfBlob,
  listApplicationPdfIds,
  updateProfileFromDirectives,
  uploadCompletedPdf,
} from './api/interactiveForm';
import ApplicationCard from './ApplicationCard';
import { filterAvailableApplications } from './ApplicationOptionsFilter';
import ApplicationReviewPage from './ApplicationReviewPage';
import { ApplicationFormData, ApplicationType, formContent as applicationFormPages, useApplicationFormContext } from './Hooks/ApplicationFormHook';
import useGetApplicationRegistry from './Hooks/UseGetApplicationRegistry';

function WebFormPageContent({
  blankFormId,
  fillingPdf,
  registryLoading,
  registryError,
  onBack,
  onWizardSubmit,
  onConfigLoaded,
  clientUsername,
  restoredFormData,
}: {
  blankFormId: string | null;
  fillingPdf: boolean;
  registryLoading: boolean;
  registryError: string | null;
  onBack: () => void;
  onWizardSubmit: (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>, profileUpdates: Record<string, unknown>) => void;
  onConfigLoaded: (config: { builderState: BuilderState | null; formTitle: string }) => void;
  clientUsername: string;
  restoredFormData?: Record<string, unknown> | null;
}) {
  if (registryLoading || fillingPdf) {
    const label = fillingPdf ? 'Generating your application...' : 'Loading form...';
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{label}</span>
        </Spinner>
      </div>
    );
  }
  if (registryError) {
    return (
      <Alert variant="warning" className="tw-mt-4">
        <div>{registryError}</div>
        <Button variant="outline-secondary" className="tw-mt-3" onClick={onBack}>
          Back to selections
        </Button>
      </Alert>
    );
  }
  if (!blankFormId) {
    return (
      <Alert variant="warning" className="tw-mt-4">
        Could not load this application. Please go back and pick a different option.
      </Alert>
    );
  }
  return (
    <InteractiveFormWizard
      applicationId={blankFormId}
      clientUsername={clientUsername}
      onSubmit={onWizardSubmit}
      onConfigLoaded={onConfigLoaded}
      initialData={restoredFormData ?? undefined}
      onBack={onBack}
    />
  );
}

function getOptionLabel(pageName: 'type' | 'person', value: string): string | null {
  if (!value) return null;
  const pageConfig = applicationFormPages.find((entry) => entry.pageName === pageName);
  const option = pageConfig?.options.find((entry) => entry.value === value);
  return option?.titleText ?? null;
}

interface ClientSearchResult {
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string;
}

const MAX_CLIENT_RESULTS = 25;

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function matchesClientSearchQuery(client: ClientSearchResult, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  const first = normalizeSearchText(client.firstName || '');
  const last = normalizeSearchText(client.lastName || '');
  const full = normalizeSearchText(`${client.firstName || ''} ${client.lastName || ''}`);
  const username = normalizeSearchText(client.username || '');
  const email = normalizeSearchText(client.email || '');

  return tokens.every((token) => (
    first.includes(token)
    || last.includes(token)
    || full.includes(token)
    || username.includes(token)
    || email.includes(token)
  ));
}

export default function ApplicationForm() {
  const {
    formContent,
    page,
    setPage,
    data,
    setData,
    isDirty,
    setIsDirty,
    handleChange,
    handleNext,
    handlePrev,
    userRole,
    shouldShowWhoForStep,
    whoForNextPage,
    clientUsername,
    clientName,
    targetClientUsername,
    setTargetClientUsername,
    targetClientName,
    setTargetClientName,
  } = useApplicationFormContext();

  const [shouldPrompt, setShouldPrompt] = useState(true);
  const [fillingPdf, setFillingPdf] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whoForMode, setWhoForMode] = useState<'existing' | 'new'>('existing');
  const [clientQuery, setClientQuery] = useState('');
  const [debouncedClientQuery, setDebouncedClientQuery] = useState('');
  const [searchingClients, setSearchingClients] = useState(false);
  const [searchResults, setSearchResults] = useState<ClientSearchResult[]>([]);
  const [showClientResults, setShowClientResults] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [agreementError, setAgreementError] = useState('');
  const [eulaAgreed, setEulaAgreed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    suffix: '',
    birthDate: '',
    email: '',
    phonenumber: '',
  });
  const [enrollFieldErrors, setEnrollFieldErrors] = useState<Record<string, string>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [applicationAvailability, setApplicationAvailability] = useState<Partial<ApplicationFormData>[]>([]);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string | null>(null);
  const [persistedApplicationId, setPersistedApplicationId] = useState<string | null>(null);
  const [wizardFormOutput, setWizardFormOutput] = useState<Record<string, unknown> | null>(null);
  const [wizardFormData, setWizardFormData] = useState<Record<string, unknown> | null>(null);
  const builderStateRef = useRef<BuilderState | null>(null);
  const formTitleRef = useRef<string>('');
  const {
    blankFormId,
    registryLoading,
    registryError,
    fetchRegistry,
  } = useGetApplicationRegistry();
  const history = useHistory();
  const clientSearchRequestIdRef = useRef(0);

  const pageCount = formContent.length;
  const hidePrev = page === 0;
  const isWhoForPage = formContent[page].pageName === 'whoFor';
  const isReviewPage = formContent[page].pageName === 'review';
  const isWebFormPage = formContent[page].pageName === 'webForm';
  const isSignAndDownloadPage = formContent[page].pageName === 'signAndDownload';
  const targetClientResolved = targetClientUsername.trim().length > 0;
  const hasCatalogApplicationSelection = data.applicationId.trim().length > 0;
  const whoForInputClassName =
    'tw-w-full tw-min-h-[3rem] tw-px-4 tw-py-3 tw-border-2 tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-text-lg';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Fetch registry info (blankFormId) when entering the review step (or webForm step if skipping review)
  useEffect(() => {
    if ((isReviewPage || isWebFormPage) && hasCatalogApplicationSelection) {
      fetchRegistry(data, isDirty, setIsDirty);
    }
  }, [isReviewPage, isWebFormPage, hasCatalogApplicationSelection, data, isDirty]);

  useEffect(() => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    fetch(`${getServerURL()}/get-available-application-options`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((items) => {
        if (!Array.isArray(items)) {
          setApplicationAvailability([]);
          setAvailabilityError('Could not load application options.');
          return;
        }
        setApplicationAvailability(
          items
            .filter((x) => x && x.applicationId && x.label)
            .map((x) => ({
              applicationId: String(x.applicationId),
              label: String(x.label),
              state: x.state == null ? '' : String(x.state),
              idType: x.idType == null ? '' : String(x.idType),
              housingStatus: x.housingStatus == null ? '' : String(x.housingStatus),
            })),
        );
      })
      .catch(() => {
        setApplicationAvailability([]);
        setAvailabilityError('Could not load application options.');
      })
      .finally(() => setAvailabilityLoading(false));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedClientQuery(clientQuery.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [clientQuery]);

  useEffect(() => {
    if (targetClientResolved && clientQuery.trim() === '') {
      setClientQuery(targetClientName || targetClientUsername);
    }
  }, [targetClientName, targetClientResolved, targetClientUsername, clientQuery]);

  useEffect(() => {
    if (!isWhoForPage || !shouldShowWhoForStep || whoForMode !== 'existing' || !showClientResults) {
      return () => {};
    }
    if (debouncedClientQuery.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return () => {};
    }

    const controller = new AbortController();
    const requestId = clientSearchRequestIdRef.current + 1;
    clientSearchRequestIdRef.current = requestId;
    setSearchingClients(true);
    setSearchError(null);

    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify({
        role: userRole,
        listType: 'clients',
        name: debouncedClientQuery,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (clientSearchRequestIdRef.current !== requestId) return;
        if (responseJSON.status === 'SUCCESS' && Array.isArray(responseJSON.people)) {
          const filtered = responseJSON.people
            .filter((client: ClientSearchResult) => matchesClientSearchQuery(client, debouncedClientQuery))
            .slice(0, MAX_CLIENT_RESULTS);
          setSearchResults(filtered);
          return;
        }
        setSearchResults([]);
        if (responseJSON.status && responseJSON.status !== 'USER_NOT_FOUND') {
          setSearchError('Could not load client search results.');
        }
      })
      .catch((error) => {
        if (clientSearchRequestIdRef.current !== requestId) return;
        if (error.name !== 'AbortError') {
          setSearchResults([]);
          setSearchError('Could not load client search results.');
        }
      })
      .finally(() => {
        if (clientSearchRequestIdRef.current !== requestId) return;
        setSearchingClients(false);
      });

    return () => controller.abort();
  }, [debouncedClientQuery, isWhoForPage, shouldShowWhoForStep, userRole, whoForMode, showClientResults]);

  const validateEnrollField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'firstname':
        return validateFirstname(value);
      case 'lastname':
        return validateLastname(value);
      case 'middlename':
        if (value.trim() === '') return '';
        return validateFirstname(value);
      case 'suffix':
        if (value.trim() === '') return '';
        return validateLastname(value);
      case 'email':
        if (value.trim() === '') return '';
        return validateEmail(value);
      case 'birthDate':
        if (!value) return 'Birth date is required';
        {
          const d = localDateFromIsoDateOnly(value);
          if (d === undefined) return 'Invalid birth date';
          return validateBirthdate(d);
        }
      case 'phonenumber':
        if (value.trim() === '') return '';
        return validatePhonenumber(value);
      default:
        return '';
    }
  }, []);

  const tryAutoSelectNewlyCreatedClient = useCallback(async (
    firstname: string,
    lastname: string,
    email: string,
    birthDate: string,
  ) => {
    const response = await fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role: userRole,
        listType: 'clients',
        name: `${firstname} ${lastname}`,
      }),
    }).then((res) => res.json());

    if (response.status !== 'SUCCESS' || !Array.isArray(response.people)) {
      return null;
    }

    const normalizedBirthDate = birthDateStringFromIsoDateOnly(birthDate);
    if (!normalizedBirthDate) return null;
    const emailTrimmed = email.trim();
    const match = response.people.find((person: ClientSearchResult) =>
      (emailTrimmed !== '' && person?.email?.toLowerCase() === emailTrimmed.toLowerCase())
      || (
        person.firstName?.toLowerCase() === firstname.toLowerCase()
        && person.lastName?.toLowerCase() === lastname.toLowerCase()
        && person.birthDate === normalizedBirthDate
      ));
    return match || null;
  }, [userRole]);

  const disablePrompt = () => {
    flushSync(() => {
      setShouldPrompt(false);
    });
  };

  const handleConfigLoaded = useCallback((config: { builderState: BuilderState | null; formTitle: string }) => {
    builderStateRef.current = config.builderState;
    formTitleRef.current = config.formTitle;
  }, []);

  const selectExistingClient = useCallback((client: ClientSearchResult) => {
    const resolvedName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.username;
    setTargetClientUsername(client.username);
    setTargetClientName(resolvedName);
    setClientQuery(resolvedName);
    setShowClientResults(false);
    setSearchResults([]);
    setSearchError(null);
  }, [setTargetClientName, setTargetClientUsername]);

  const handleEnrollFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEnrollForm((prev) => ({ ...prev, [name]: value }));
    if (enrollFieldErrors[name]) {
      setEnrollFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleEnrollNewClient = useCallback(async () => {
    const fieldNames = ['firstname', 'middlename', 'lastname', 'suffix', 'birthDate', 'email', 'phonenumber'] as const;
    const nextErrors: Record<string, string> = {};
    fieldNames.forEach((fieldName) => {
      const error = validateEnrollField(fieldName, enrollForm[fieldName]);
      if (error) {
        nextErrors[fieldName] = error;
      }
    });
    setEnrollFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!eulaAgreed || !termsAccepted) {
      setAgreementError('You must agree to the EULA and Terms and Conditions before continuing.');
      return;
    }
    setAgreementError('');
    const birthDatePayload = birthDateStringFromIsoDateOnly(enrollForm.birthDate);
    if (!birthDatePayload) {
      setEnrollFieldErrors((prev) => ({ ...prev, birthDate: 'Invalid birth date' }));
      return;
    }
    setEnrollSubmitting(true);

    try {
      const response = await enrollClient({
        firstname: enrollForm.firstname,
        middlename: enrollForm.middlename.trim() || undefined,
        lastname: enrollForm.lastname,
        suffix: enrollForm.suffix.trim() || undefined,
        birthDate: birthDatePayload,
        email: enrollForm.email.trim(),
        phonenumber: enrollForm.phonenumber,
      });

      if (response.status !== 'ENROLL_SUCCESS') {
        setSubmitError(`Could not enroll client: ${response.status}`);
        return;
      }

      let createdUser: ClientSearchResult | null = null;
      if (response.username) {
        createdUser = {
          username: response.username,
          firstName: response.firstName || enrollForm.firstname,
          lastName: response.lastName || enrollForm.lastname,
          email: response.email,
          birthDate: response.birthDate,
        };
      } else {
        createdUser = await tryAutoSelectNewlyCreatedClient(
          enrollForm.firstname,
          enrollForm.lastname,
          enrollForm.email.trim(),
          enrollForm.birthDate,
        );
      }
      if (!createdUser) {
        setSubmitError('Client enrolled, but automatic selection failed. Please search and select the client.');
        setWhoForMode('existing');
        setClientQuery(`${enrollForm.firstname} ${enrollForm.lastname}`.trim());
        return;
      }

      selectExistingClient(createdUser);
      setSubmitError(null);
      setWhoForMode('existing');
      setPage(whoForNextPage);
    } catch {
      setSubmitError('Could not enroll client. Please try again.');
    } finally {
      setEnrollSubmitting(false);
    }
  }, [
    eulaAgreed,
    enrollForm,
    selectExistingClient,
    setPage,
    termsAccepted,
    tryAutoSelectNewlyCreatedClient,
    validateEnrollField,
    whoForNextPage,
    enrollFieldErrors,
  ]);

  const handleWizardSubmit = useCallback(
    async (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>, profileUpdates: Record<string, unknown>) => {
      if (!blankFormId || Object.keys(pdfFill).length === 0) {
        handleNext();
        return;
      }
      setFillingPdf(true);
      setSubmitError(null);
      try {
        let existingApplicationIdsBeforeSave: Set<string> | null = null;
        try {
          existingApplicationIdsBeforeSave = new Set(await listApplicationPdfIds(targetClientUsername));
        } catch {
          existingApplicationIdsBeforeSave = null;
        }
        const blob = await fillPdfBlob(blankFormId, pdfFill, targetClientUsername);
        const uploadResult = await uploadCompletedPdf(blob, blankFormId, formOutput, targetClientUsername);
        let persistedId = uploadResult.applicationId || uploadResult.fileId;
        if (!persistedId && existingApplicationIdsBeforeSave) {
          const applicationIdsAfterSave = await listApplicationPdfIds(targetClientUsername);
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
        setPersistedApplicationId(persistedId);
        if (profileUpdates && Object.keys(profileUpdates).length > 0) {
          try {
            await updateProfileFromDirectives(profileUpdates, targetClientUsername);
          } catch (updateErr) {
            console.warn('Failed to update profile from form directives in background', updateErr);
          }
        }
        const url = URL.createObjectURL(blob);
        setFilledPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setWizardFormOutput(formOutput);
        setWizardFormData(formData);
        handleNext();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Could not generate PDF. Please try again.');
      } finally {
        setFillingPdf(false);
      }
    },
    [blankFormId, targetClientUsername, handleNext],
  );

  const handleSaveSuccess = useCallback(() => {
    if (filledPdfUrl) URL.revokeObjectURL(filledPdfUrl);
    setFilledPdfUrl(null);
    setPersistedApplicationId(null);
    setWizardFormOutput(null);
    setWizardFormData(null);
    disablePrompt();
    history.push('/applications');
  }, [filledPdfUrl, history]);

  useEffect(() => () => {
    if (filledPdfUrl) URL.revokeObjectURL(filledPdfUrl);
  }, [filledPdfUrl]);

  const clickHandler = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) {
      handleChange(e.target.name, e.target.value);
    }
  };

  const availableApplications = filterAvailableApplications(data, applicationAvailability);
  const dataAttr = formContent[page].dataAttr;
  const applicationSelectionOptions = availableApplications.filter(
    (application) => application.applicationId && application.label,
  );
  const isCatalogSelectionStep = isReviewPage && !hasCatalogApplicationSelection;
  const catalogHasConstraintFor = (attr: keyof ApplicationFormData) =>
    attr !== 'person' && availableApplications.some((application) => {
      const value = application[attr];
      return typeof value === 'string' && value.trim().length > 0;
    });
  const isLegacyOptionDisabled = (attr: keyof ApplicationFormData, value: string) =>
    catalogHasConstraintFor(attr)
    && !availableApplications.some((application) => application[attr] === value);
  const selectCatalogApplication = useCallback(
    (application: Partial<ApplicationFormData>) => {
      if (!application.applicationId || !application.label) return;
      setData((prevData) => ({
        ...prevData,
        applicationId: application.applicationId || '',
        label: application.label || '',
        state: application.state || '',
        idType: application.idType || '',
        housingStatus: application.housingStatus || '',
      }));
      setIsDirty(true);
      setSubmitError(null);
    },
    [setData, setIsDirty],
  );
  const applicationTypeLabel = data.label || getOptionLabel('type', data.type) || 'your';
  const targetPersonLabel = targetClientName || targetClientUsername || clientName || clientUsername || getOptionLabel('person', data.person) || 'you';
  let pageTitle = formContent[page].title(data.type);
  if (isCatalogSelectionStep) {
    pageTitle = 'Choose an application';
  }
  if (isWebFormPage) {
    pageTitle = `Fill out ${applicationTypeLabel} application for ${targetPersonLabel}`;
  }
  const canContinueWhoFor = !shouldShowWhoForStep || targetClientResolved;
  const canEditAttachments =
    userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director;
  let nextButtonLabel = 'Next';
  if (isWhoForPage) {
    if (whoForMode === 'new') {
      nextButtonLabel = enrollSubmitting ? 'Creating Client...' : 'Create Client and Continue';
    } else {
      nextButtonLabel = 'Continue';
    }
  }

  return (
    <>
      <PromptOnLeave shouldPrompt={shouldPrompt} />
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>

      {/* Form content: wide container with comfortable type for client readability */}
      <div
        className={`tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-10 tw-pt-10 tw-pb-12 ${
          isWhoForPage ? 'tw-max-w-7xl' : 'tw-max-w-6xl'
        }`}
      >
        {(!isReviewPage || isCatalogSelectionStep) && (
          <>
            <div className={`tw-flex tw-justify-between tw-items-end ${isWebFormPage ? 'tw-mb-6' : 'tw-mb-1'}`}>
              <h2 className="tw-text-3xl tw-font-semibold tw-m-0">{pageTitle}</h2>
            </div>
            {formContent[page].subtitle && (
              <p className="tw-text-lg tw-text-gray-600 tw-mb-4">{formContent[page].subtitle}</p>
            )}
          </>
        )}
        {availabilityError && (
          <Alert variant="warning" className="tw-mb-4">
            {availabilityError}
          </Alert>
        )}

        {isWhoForPage && (
          <div className="tw-bg-white tw-border-2 tw-border-gray-200 tw-rounded-xl tw-p-8 tw-shadow-sm tw-w-full [&_.form-label]:tw-text-lg [&_.form-check-label]:tw-text-base [&_.form-check-input]:tw-mt-1 [&_.form-check-input]:tw-scale-125 [&_small]:tw-text-base">
            {!shouldShowWhoForStep ? (
              <Alert variant="info" className="tw-mb-0">
                This step is only shown to workers, admins, and directors.
              </Alert>
            ) : (
              <>
                <div className="tw-flex tw-gap-3 tw-mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setWhoForMode('existing');
                      setShowClientResults(true);
                      setSubmitError(null);
                    }}
                    className={`tw-px-6 tw-py-3 tw-rounded-lg tw-text-lg tw-font-medium tw-border-2 tw-transition-colors ${
                      whoForMode === 'existing'
                        ? 'tw-bg-twprimary tw-text-white tw-border-twprimary hover:tw-bg-blue-700'
                        : 'tw-bg-white tw-text-twprimary tw-border-twprimary hover:tw-bg-blue-50'
                    }`}
                  >
                    Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWhoForMode('new');
                      setSubmitError(null);
                    }}
                    className={`tw-px-6 tw-py-3 tw-rounded-lg tw-text-lg tw-font-medium tw-border-2 tw-transition-colors ${
                      whoForMode === 'new'
                        ? 'tw-bg-twprimary tw-text-white tw-border-twprimary hover:tw-bg-blue-700'
                        : 'tw-bg-white tw-text-twprimary tw-border-twprimary hover:tw-bg-blue-50'
                    }`}
                  >
                    New Client
                  </button>
                </div>

                {whoForMode === 'existing' ? (
                  <div>
                    <Form.Group controlId="whoForClientSearch">
                      <Form.Label>Search client by name</Form.Label>
                      <Form.Control
                        type="text"
                        className={whoForInputClassName}
                        placeholder="Start typing a client name..."
                        value={clientQuery}
                        onChange={(event) => {
                          setClientQuery(event.target.value);
                          setShowClientResults(true);
                          setSearchError(null);
                          setSearchResults([]);
                          if (targetClientUsername) {
                            setTargetClientUsername('');
                            setTargetClientName('');
                          }
                        }}
                      />
                    </Form.Group>
                    {searchingClients && (
                      <div className="tw-text-base tw-text-gray-500 tw-mt-2">Searching...</div>
                    )}
                    {searchError && (
                      <Alert variant="warning" className="tw-mt-3">
                        {searchError}
                      </Alert>
                    )}
                    {showClientResults && searchResults.length > 0 && (
                      <div className="tw-border-2 tw-rounded-lg tw-mt-3 tw-divide-y tw-divide-gray-200 tw-max-h-80 tw-overflow-y-auto">
                        {searchResults.map((client) => {
                          const displayName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.username;
                          return (
                            <button
                              key={client.username}
                              type="button"
                              onClick={() => selectExistingClient(client)}
                              className="tw-w-full tw-text-left tw-px-5 tw-py-4 hover:tw-bg-gray-50 tw-border-0 tw-bg-white"
                            >
                              <div className="tw-font-semibold tw-text-lg">{displayName}</div>
                              <div className="tw-text-sm tw-text-gray-500">{client.username}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4 tw-min-w-0">
                      <Form.Group controlId="newClientFirstName" className="tw-min-w-0">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          name="firstname"
                          value={enrollForm.firstname}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            firstname: validateEnrollField('firstname', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.firstname && <small className="tw-text-red-600">{enrollFieldErrors.firstname}</small>}
                      </Form.Group>
                      <Form.Group controlId="newClientMiddleName" className="tw-min-w-0">
                        <Form.Label>Middle Name (optional)</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          name="middlename"
                          value={enrollForm.middlename}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            middlename: validateEnrollField('middlename', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.middlename && <small className="tw-text-red-600">{enrollFieldErrors.middlename}</small>}
                      </Form.Group>
                      <Form.Group controlId="newClientLastName" className="tw-min-w-0">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          name="lastname"
                          value={enrollForm.lastname}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            lastname: validateEnrollField('lastname', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.lastname && <small className="tw-text-red-600">{enrollFieldErrors.lastname}</small>}
                      </Form.Group>
                      <Form.Group controlId="newClientSuffix" className="tw-min-w-0">
                        <Form.Label>Suffix (optional)</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          name="suffix"
                          placeholder="e.g. Jr, III"
                          value={enrollForm.suffix}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            suffix: validateEnrollField('suffix', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.suffix && <small className="tw-text-red-600">{enrollFieldErrors.suffix}</small>}
                      </Form.Group>
                    </div>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mt-4">
                      <Form.Group controlId="newClientDob">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          type="date"
                          name="birthDate"
                          value={enrollForm.birthDate}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            birthDate: validateEnrollField('birthDate', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.birthDate && <small className="tw-text-red-600">{enrollFieldErrors.birthDate}</small>}
                      </Form.Group>
                      <Form.Group controlId="newClientEmail">
                        <Form.Label>Email (optional)</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          type="email"
                          name="email"
                          value={enrollForm.email}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            email: validateEnrollField('email', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.email && <small className="tw-text-red-600">{enrollFieldErrors.email}</small>}
                      </Form.Group>
                      <Form.Group controlId="newClientPhone" className="md:tw-col-span-2">
                        <Form.Label>Phone (optional)</Form.Label>
                        <Form.Control
                          className={whoForInputClassName}
                          name="phonenumber"
                          value={enrollForm.phonenumber}
                          onChange={handleEnrollFieldChange}
                          onBlur={(e) => setEnrollFieldErrors((prev) => ({
                            ...prev,
                            phonenumber: validateEnrollField('phonenumber', e.target.value),
                          }))}
                        />
                        {enrollFieldErrors.phonenumber && <small className="tw-text-red-600">{enrollFieldErrors.phonenumber}</small>}
                      </Form.Group>
                    </div>
                    <div className="tw-mt-3">
                      <Form.Check
                        id="whoForEula"
                        checked={eulaAgreed}
                        onChange={(e) => {
                          setEulaAgreed(e.target.checked);
                          setAgreementError('');
                        }}
                        label={(
                          <span>
                            I confirm the client agrees to the{' '}
                            <a
                              href="https://docs.google.com/document/d/18O-2Q3hdjeMlDMg696F62rgBhW7fttluUSfYG5lb-uo/edit?usp=sharing"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              End User License Agreement
                            </a>
                          </span>
                        )}
                      />
                      <Form.Check
                        id="whoForTerms"
                        className="tw-mt-2"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          setAgreementError('');
                        }}
                        label="I have read and agree to the Terms and Conditions and Privacy Policy."
                      />
                      {agreementError && <small className="tw-text-red-600">{agreementError}</small>}
                    </div>
                    <p className="tw-mt-4 tw-mb-0 tw-text-base tw-text-blue-600">
                      This information is used as the applicant information for this application.
                    </p>
                  </div>
                )}

                {targetClientResolved && (
                  <Alert variant="success" className="tw-mt-4 tw-mb-0">
                    Selected client: <strong>{targetClientName || targetClientUsername}</strong>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {!isWhoForPage && isCatalogSelectionStep && (
          <div className="tw-bg-white tw-border-2 tw-border-gray-200 tw-rounded-xl tw-p-8 tw-shadow-sm tw-w-full">
            {availabilityLoading && (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
              </div>
            )}
            {!availabilityLoading && applicationSelectionOptions.length === 0 && (
              <Alert variant="warning" className="tw-mb-0">
                No matching applications are available.
              </Alert>
            )}
            {!availabilityLoading && applicationSelectionOptions.length > 0 && (
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
                {applicationSelectionOptions.map((application) => (
                  <button
                    key={application.applicationId}
                    type="button"
                    onClick={() => selectCatalogApplication(application)}
                    className="tw-text-left tw-rounded-lg tw-border-2 tw-border-gray-200 tw-bg-white tw-p-4 hover:tw-border-twprimary hover:tw-bg-blue-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  >
                    <span className="tw-block tw-text-lg tw-font-semibold tw-text-gray-900">
                      {application.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isWhoForPage && !isCatalogSelectionStep && (
          <Form
            className="form tw-grid tw-gap-6 tw-justify-center tw-grid-cols-2"
            style={{
              gridTemplateColumns: formContent[page].cols && `repeat(${formContent[page].cols}, minmax(0, 1fr))`,
              gridTemplateRows: formContent[page].rows && `repeat(${formContent[page].rows}, minmax(0, 1fr))`,
            }}
            onClick={clickHandler}
          >
            {dataAttr &&
              formContent[page].options
                .filter((option) => option.for === null || option.for.has(data.type as ApplicationType))
                .map((option) => (
                  <ApplicationCard
                    key={option.value}
                    iconSrc={option.iconSrc}
                    iconAlt={option.iconAlt}
                    titleText={option.titleText}
                    subtitleText={option.subtitleText}
                    checked={data[dataAttr] === option.value}
                    name={dataAttr}
                    value={option.value}
                    disabled={isLegacyOptionDisabled(dataAttr, option.value)}
                  />
                ))}
          </Form>
        )}

        {isReviewPage && hasCatalogApplicationSelection && (
          <ApplicationReviewPage
            data={data}
            blankFormId={blankFormId}
            clientName={targetClientName || targetClientUsername}
          />
        )}

        {isWebFormPage && (
          <WebFormPageContent
            blankFormId={blankFormId}
            fillingPdf={fillingPdf}
            registryLoading={registryLoading}
            registryError={registryError}
            onBack={handlePrev}
            onWizardSubmit={handleWizardSubmit}
            onConfigLoaded={handleConfigLoaded}
            clientUsername={targetClientUsername}
            restoredFormData={wizardFormData}
          />
        )}

        {isSignAndDownloadPage && filledPdfUrl && persistedApplicationId && wizardFormOutput && (
          <SignAndDownloadViewer
            fileUrl={filledPdfUrl}
            signaturePlacements={builderStateRef.current?.signaturePlacements ?? []}
            title={formTitleRef.current}
            applicationId={persistedApplicationId}
            formAnswers={wizardFormOutput}
            clientUsername={targetClientUsername}
            onSaveSuccess={handleSaveSuccess}
            postRequirements={builderStateRef.current?.postRequirements}
            showPdfEditControls
            pdfFormsReadOnly
            canEditAttachments={canEditAttachments}
          />
        )}

        {isSignAndDownloadPage && !filledPdfUrl && (
          <div className="tw-flex tw-bg-gray-100 tw-w-full tw-h-56 tw-justify-center tw-items-center tw-border tw-rounded tw-text-gray-500">
            Please complete the form on the previous step to generate your PDF.
          </div>
        )}

        {submitError && (isWebFormPage || isSignAndDownloadPage) && (
          <Alert variant="danger" className="tw-mt-4" onClose={() => setSubmitError(null)} dismissible>
            {submitError}
          </Alert>
        )}

        <div className={`tw-flex tw-mt-8 tw-gap-4 ${isReviewPage ? 'tw-justify-end' : 'tw-justify-between'}`}>
          <Button
            size="lg"
            onClick={handlePrev}
            className={`${hidePrev ? 'tw-invisible ' : ' '} ${isWebFormPage || availabilityLoading || isWhoForPage || isReviewPage ? 'tw-hidden ' : ' '}`}
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={async () => {
              setSubmitError(null);
              if (isWhoForPage) {
                if (whoForMode === 'new') {
                  await handleEnrollNewClient();
                  return;
                }
                setPage(whoForNextPage);
                return;
              }
              handleNext();
            }}
            disabled={
              (isWhoForPage && whoForMode === 'existing' && !canContinueWhoFor)
              || (isWhoForPage && whoForMode === 'new' && enrollSubmitting)
              || (isReviewPage && !hasCatalogApplicationSelection)
            }
            className={`${isReviewPage || isWhoForPage ? ' ' : 'tw-hidden '}`}
          >
            {nextButtonLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
