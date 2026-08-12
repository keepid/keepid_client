import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAlert } from 'react-alert';
import ReactMarkdown, { type Components } from 'react-markdown';
import { useHistory } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import getServerURL from '../../../serverOverride';
import Role from '../../../static/Role';
import HomelessnessDefinitionModal from '../../BaseComponents/HomelessnessDefinitionModal';
import { isValidPennDotNumber } from '../../BaseComponents/pennDotNumber';
import PennDotNumberField from '../../BaseComponents/PennDotNumberField';
import DocumentsInlineUpload from '../../Documents/DocumentsInlineUpload';
import { IdCategories } from '../../Documents/IdCategories';
import {
  completeServiceRecord,
  createClassifiedService,
  createManualService,
  loadCaseSelector,
  loadClientLoginDetails,
  loadPennDotNumber,
  previewManualService,
  resolveCaseOutcome,
  savePennDotNumber,
  uploadServicePdf,
} from './flowApi';
import type {
  FulfillmentMode,
  ProposedAction,
  RegistryApplicationOption,
  ResolvedOutcome,
  SelectorCompletionContext,
  SelectorFlow,
  SelectorNode,
  SelectorPathStep,
  SelectorTransition,
  ServiceRecordResult,
} from './types';

interface Props {
  availableApplications: RegistryApplicationOption[];
  clientUsername?: string;
  clientName?: string;
  viewerUsername?: string;
  viewerRole?: Role;
  viewerName?: string;
  organizationName?: string;
}

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const errorMessage = (error: unknown) => (
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'
);

const displayBirthDate = (value: string) => (
  value.replace(/^(\d{2})-(\d{2})-(\d{4})$/, '$1/$2/$3')
);

const descriptionMarkdownComponents: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer">{children}</a>
  ),
};

const ApplicationSelectorFlow = ({
  availableApplications,
  clientUsername = '',
  clientName = '',
  viewerUsername,
  viewerRole,
  viewerName,
  organizationName,
}: Props) => {
  const history = useHistory();
  const alert = useAlert();
  const [flow, setFlow] = useState<SelectorFlow | null>(null);
  const [nodeId, setNodeId] = useState('');
  const [path, setPath] = useState<SelectorPathStep[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [fieldValue, setFieldValue] = useState('');
  const [resolved, setResolved] = useState<ResolvedOutcome | null>(null);
  const [record, setRecord] = useState<ServiceRecordResult | null>(null);
  const [confirmedEffects, setConfirmedEffects] = useState<string[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualPreview, setManualPreview] = useState<string | null>(null);
  const [homelessnessDefinitionOpen, setHomelessnessDefinitionOpen] = useState(false);
  const [completedPhotoIdUploads, setCompletedPhotoIdUploads] = useState<Set<string>>(new Set());
  const [clientLoginDetails, setClientLoginDetails] = useState({
    penndotNumber: '',
    birthDate: '',
  });
  const [clientLoginDetailsLoading, setClientLoginDetailsLoading] = useState(false);
  const [manual, setManual] = useState({
    serviceTitle: '',
    manualReason: 'NO_MATCH' as 'NO_MATCH' | 'UNSURE' | 'URGENT_BYPASS' | 'OTHER',
    manualReasonDetail: '',
    clientInstructionsMarkdown: '# Next steps\n\n',
    workerInstructionsMarkdown: '',
    fulfillmentMode: 'INSTRUCTIONS_ONLY' as FulfillmentMode,
    registryEntryId: '',
  });
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    loadCaseSelector()
      .then((loaded) => {
        if (!active) return;
        setFlow(loaded);
        setNodeId(loaded.rootNodeId);
      })
      .catch((loadError) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => { active = false; };
  }, []);

  const nodes = useMemo(
    () => new Map((flow?.nodes || []).map((node) => [node.id, node])),
    [flow],
  );
  const currentNode = nodes.get(nodeId);

  useEffect(() => {
    if (!flow || currentNode?.type !== 'OUTCOME') return;
    setBusy(true);
    setError(null);
    resolveCaseOutcome({
      clientUsername,
      publishToken: flow.publishToken,
      path,
      responses,
    })
      .then((outcome) => {
        setResolved(outcome);
        setConfirmedEffects(outcome.proposedActions.map((action) => action.effectId));
      })
      .catch((resolveError) => setError(errorMessage(resolveError)))
      .finally(() => setBusy(false));
  }, [clientUsername, currentNode?.id, currentNode?.type, flow, path, responses]);

  useEffect(() => {
    if (!currentNode?.responseKey) {
      setFieldValue('');
      return;
    }
    setFieldValue(responses[currentNode.responseKey] || '');
  }, [currentNode?.id, currentNode?.responseKey, responses]);

  useEffect(() => {
    if (currentNode?.componentKey !== 'penndot-number' || !currentNode.responseKey) return undefined;
    if (responses[currentNode.responseKey] !== undefined) return undefined;
    let active = true;
    loadPennDotNumber(clientUsername)
      .then((value) => {
        if (active) setFieldValue(value);
      })
      .catch((loadError) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => { active = false; };
  }, [clientUsername, currentNode?.componentKey, currentNode?.id, currentNode?.responseKey, responses]);

  useEffect(() => {
    if (currentNode?.componentKey !== 'penndot-login-details') return undefined;
    let active = true;
    setClientLoginDetailsLoading(true);
    loadClientLoginDetails(clientUsername)
      .then((details) => {
        if (active) setClientLoginDetails(details);
      })
      .catch((loadError) => {
        if (active) setError(errorMessage(loadError));
      })
      .finally(() => {
        if (active) setClientLoginDetailsLoading(false);
      });
    return () => { active = false; };
  }, [clientUsername, currentNode?.componentKey, currentNode?.id]);

  const backToApplications = () => history.push({
    pathname: '/applications',
    search: `?client=${encodeURIComponent(clientUsername)}`,
    state: { clientUsername, clientName },
  });

  const reset = () => {
    if (!flow) return;
    setNodeId(flow.rootNodeId);
    setPath([]);
    setResponses({});
    setResolved(null);
    setRecord(null);
    setPdf(null);
    setError(null);
    setManualMode(false);
  };

  const follow = (transition: SelectorTransition, nextResponses = responses) => {
    if (!currentNode) return;
    setPath((steps) => [...steps, { nodeId: currentNode.id, transitionKey: transition.key }]);
    setResponses(nextResponses);
    setNodeId(transition.childNodeId);
    setResolved(null);
    setError(null);
  };

  const goBack = () => {
    if (record) return;
    const prior = path[path.length - 1];
    if (!prior) {
      backToApplications();
      return;
    }
    const priorNode = nodes.get(prior.nodeId);
    setPath((steps) => steps.slice(0, -1));
    setNodeId(prior.nodeId);
    setResolved(null);
    if (priorNode?.responseKey) {
      setResponses((values) => {
        const next = { ...values };
        delete next[priorNode.responseKey as string];
        return next;
      });
    }
  };

  const selectAnswer = async (transition: SelectorTransition) => {
    if (!currentNode) return;
    if (!currentNode.componentKey) {
      follow(transition);
      return;
    }
    const config = currentNode.componentConfig || {};
    if (
      currentNode.componentKey === 'photo-id-upload'
      && config.required !== false
      && !completedPhotoIdUploads.has(currentNode.id)
    ) {
      setError('Upload the photo ID before continuing.');
      return;
    }
    const isInformation = [
      'information',
      'homelessness-definition',
      'penndot-login-details',
      'photo-id-upload',
    ].includes(currentNode.componentKey);
    const value = fieldValue.trim();
    if (!isInformation && config.required !== false && !value) {
      setError('Enter a value to continue.');
      return;
    }
    if (currentNode.componentKey === 'penndot-number') {
      const pattern = String(config.pattern || '^\\d{8}$');
      if ((value && !new RegExp(pattern).test(value)) || !isValidPennDotNumber(value)) {
        setError(String(config.helpText || 'Enter a valid 8-digit PennDOT customer number.'));
        return;
      }
      setBusy(true);
      setError(null);
      try {
        await savePennDotNumber(clientUsername, value);
      } catch (saveError) {
        setError(errorMessage(saveError));
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    const next = currentNode.responseKey && !isInformation
      ? { ...responses, [currentNode.responseKey]: value }
      : responses;
    follow(transition, next);
  };

  const applicationOption = (applicationId?: string | null) => availableApplications.find(
    (application) => application.applicationId === applicationId,
  );

  const startWebForm = (created?: ServiceRecordResult) => {
    const registryEntryId = created?.registryEntryId || resolved?.registryEntryId;
    const registryApplicationId = created?.registryApplicationId || resolved?.registryApplicationId;
    if (!registryEntryId || !registryApplicationId || (!created && (!flow || !resolved))) return;
    const option = applicationOption(registryApplicationId);
    const selectorCompletion: SelectorCompletionContext | undefined = !created && flow
      ? {
        publishToken: flow.publishToken,
        path,
        responses,
        idempotencyKey: uuid(),
        confirmedEffectIds: confirmedEffects,
      }
      : undefined;
    history.push({
      pathname: '/applications/createnew',
      state: {
        clientUsername,
        clientName,
        serviceRecordId: created?.applicationId,
        presetApplication: {
          applicationId: registryApplicationId,
          label: option?.label || created?.serviceTitle || resolved?.serviceTitle || 'Application',
          state: option?.state || '',
          idType: option?.idType || '',
          housingStatus: option?.housingStatus || '',
        },
        startAtWebForm: true,
        selectorCompletion,
      },
    });
  };

  const createOutcomeRecord = async () => {
    if (!flow || !resolved) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createClassifiedService({
        clientUsername,
        publishToken: flow.publishToken,
        path,
        responses,
        idempotencyKey: uuid(),
        confirmedEffectIds: confirmedEffects,
      });
      setRecord(created);
      if (created.fulfillmentMode === 'INSTRUCTIONS_ONLY') {
        await completeServiceRecord(created.applicationId);
      }
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setBusy(false);
    }
  };

  const finishPdf = async () => {
    if (!record || !pdf) return;
    setBusy(true);
    setError(null);
    try {
      await uploadServicePdf(record.applicationId, pdf);
      await completeServiceRecord(record.applicationId);
      backToApplications();
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setBusy(false);
    }
  };

  const createManualRecord = async () => {
    if (!manual.serviceTitle.trim() || !manual.clientInstructionsMarkdown.trim()) {
      setError('Add a service title and client instructions.');
      return;
    }
    if (manual.fulfillmentMode === 'WEB_FORM' && !manual.registryEntryId) {
      setError('Choose an application for the web form.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createManualService({
        clientUsername,
        idempotencyKey: uuid(),
        ...manual,
        attemptedPath: path,
        responses,
      });
      setRecord(created);
      if (created.fulfillmentMode === 'WEB_FORM') startWebForm(created);
      if (created.fulfillmentMode === 'INSTRUCTIONS_ONLY') {
        await completeServiceRecord(created.applicationId);
      }
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setBusy(false);
    }
  };

  const toggleManualPreview = async () => {
    if (manualPreview) {
      setManualPreview(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const preview = await previewManualService({
        clientUsername,
        serviceTitle: manual.serviceTitle,
        clientInstructionsMarkdown: manual.clientInstructionsMarkdown,
        workerInstructionsMarkdown: manual.workerInstructionsMarkdown,
        fulfillmentMode: manual.fulfillmentMode,
        registryEntryId: manual.registryEntryId || undefined,
        attemptedPath: path,
        responses,
      });
      setManualPreview(preview.clientSheetMarkdown);
    } catch (previewError) {
      setError(errorMessage(previewError));
    } finally {
      setBusy(false);
    }
  };

  const pdfUpload = (label = 'Completed application PDF') => (
    <div className="tw-mt-5 tw-rounded-lg tw-border-2 tw-border-dashed tw-border-blue-300 tw-bg-blue-50 tw-p-5">
      <label htmlFor="case-pdf" className="tw-block tw-font-semibold tw-text-blue-950">{label}</label>
      <p className="tw-mt-1 tw-text-sm tw-text-blue-800">Save a PDF completed outside Keep.id to this same service record.</p>
      <input
        ref={fileInput}
        id="case-pdf"
        type="file"
        accept="application/pdf,.pdf"
        className="tw-mt-3 tw-block tw-w-full tw-text-sm"
        onChange={(event) => setPdf(event.target.files?.[0] || null)}
      />
      {pdf && <p className="tw-mt-2 tw-text-sm tw-font-medium tw-text-green-800">Selected: {pdf.name}</p>}
    </div>
  );

  const renderChoice = (node: SelectorNode) => (
    <div>
      {node.componentKey && (() => {
        const config = node.componentConfig || {};
        const information = node.componentKey === 'information';
        const type = node.componentKey === 'date-input' ? 'date' : 'text';
        if (node.componentKey === 'penndot-number') {
          return (
            <PennDotNumberField
              id={`penndot-number-${node.id}`}
              value={fieldValue}
              onChange={setFieldValue}
              label={String(config.label || 'PennDOT customer number')}
              helpText={String(config.helpText || 'Enter the 8-digit customer number shown on PennDOT records.')}
              disabled={busy}
              className="tw-mb-5 tw-block tw-max-w-2xl"
            />
          );
        }
        if (node.componentKey === 'homelessness-definition') {
          return (
            <button
              type="button"
              className="tw-mb-5 tw-rounded-md tw-border tw-border-blue-300 tw-bg-white tw-px-4 tw-py-2 tw-font-semibold tw-text-blue-700 hover:tw-bg-blue-50"
              onClick={() => setHomelessnessDefinitionOpen(true)}
            >
              Click here for definition of homelessness
            </button>
          );
        }
        if (node.componentKey === 'penndot-login-details') {
          return (
            <div className="tw-mb-5 tw-max-w-2xl tw-rounded-lg tw-border tw-border-slate-200 tw-bg-slate-50 tw-p-5 tw-text-slate-950">
              <p className="tw-mb-3 tw-font-semibold">Log in with</p>
              <dl className="tw-grid tw-gap-2 sm:tw-grid-cols-[auto_1fr]">
                <dt className="tw-font-medium">Photo ID number:</dt>
                <dd className="tw-font-mono">{clientLoginDetailsLoading ? 'Loading…' : (clientLoginDetails.penndotNumber || 'Not saved')}</dd>
                <dt className="tw-font-medium">Date of birth:</dt>
                <dd>{clientLoginDetailsLoading ? 'Loading…' : (displayBirthDate(clientLoginDetails.birthDate) || 'Not saved')}</dd>
              </dl>
            </div>
          );
        }
        if (node.componentKey === 'photo-id-upload') {
          const uploadComplete = completedPhotoIdUploads.has(node.id);
          return (
            <div className="tw-mb-5 tw-max-w-3xl">
              <div className="tw-mb-3">
                <h3 className="tw-text-lg tw-font-semibold tw-text-slate-950">
                  {String(config.label || 'Upload the client’s photo ID')}
                </h3>
                <p className="tw-mt-1 tw-text-sm tw-text-slate-600">
                  {String(config.helpText || 'Send a secure phone link or drag a PDF or image into the box.')}
                </p>
              </div>
              <DocumentsInlineUpload
                targetUser={clientUsername}
                alert={alert}
                onUploadComplete={() => {
                  setCompletedPhotoIdUploads((completed) => new Set(completed).add(node.id));
                  setError(null);
                }}
                viewerUsername={viewerUsername}
                viewerRole={viewerRole}
                viewerName={viewerName}
                organizationName={organizationName}
                clientName={clientName}
                initialCategory={IdCategories.DriversLicense}
                lockedCategory
              />
              {uploadComplete && (
                <p className="tw-mt-3 tw-rounded-md tw-border tw-border-green-200 tw-bg-green-50 tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-green-800">
                  Photo ID uploaded. You can continue.
                </p>
              )}
            </div>
          );
        }
        return information ? (
          <div className="tw-mb-5 tw-rounded-lg tw-border tw-border-blue-200 tw-bg-blue-50 tw-p-5 tw-text-blue-950">
            {String(config.helpText || 'Review this information before continuing.')}
          </div>
        ) : (
          <label className="tw-mb-5 tw-block tw-max-w-2xl tw-font-medium tw-text-gray-900">
            {String(config.label || 'Response')}
            <input
              type={type}
              inputMode={node.componentKey === 'penndot-number' ? 'numeric' : undefined}
              maxLength={Number(config.maxLength || 128)}
              className="form-control tw-mt-2"
              value={fieldValue}
              onChange={(event) => setFieldValue(
                node.componentKey === 'penndot-number'
                  ? event.target.value.replace(/\D/g, '')
                  : event.target.value,
              )}
            />
            {config.helpText && <span className="tw-mt-2 tw-block tw-text-sm tw-text-gray-600">{String(config.helpText)}</span>}
          </label>
        );
      })()}
      {node.componentKey === 'photo-id-upload' ? (
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
          <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {node.transitions.map((transition) => (
              <button
                key={transition.id}
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => selectAnswer(transition)}
              >
                {transition.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={`tw-grid tw-gap-4 ${node.transitions.length === 2 ? 'md:tw-grid-cols-2' : 'md:tw-grid-cols-3'}`}>
            {node.transitions.map((transition) => (
              <div
                key={transition.id}
                className="tw-flex tw-min-h-48 tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-text-center tw-shadow-sm tw-transition hover:tw-border-blue-500 hover:tw-shadow-md"
              >
                <button
                  type="button"
                  disabled={busy}
                  className="tw-flex tw-flex-1 tw-flex-col tw-items-stretch tw-justify-center tw-bg-white tw-p-4 hover:tw-bg-blue-50"
                  onClick={() => selectAnswer(transition)}
                >
                  {transition.assetId && (
                    <span className="tw-mb-4 tw-flex tw-h-32 tw-w-full tw-items-center tw-justify-center tw-overflow-hidden tw-rounded-lg tw-border tw-border-slate-100 tw-bg-slate-50">
                      <img
                        src={`${getServerURL()}/api/case-selector/assets/${transition.assetId}`}
                        alt={transition.assetAltText || ''}
                        className="tw-h-full tw-w-full tw-object-contain"
                      />
                    </span>
                  )}
                  <span className="tw-font-semibold tw-text-slate-950">
                    {busy && node.componentKey === 'penndot-number' ? 'Saving…' : transition.label}
                  </span>
                </button>
                {transition.description && (
                  <div className="tw-prose tw-prose-sm tw-max-w-none tw-border-t tw-border-slate-100 tw-px-4 tw-py-3 tw-text-left tw-text-gray-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={descriptionMarkdownComponents}>
                      {transition.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline-dark tw-mt-6" onClick={goBack}>Back</button>
        </>
      )}
    </div>
  );

  const actionToggle = (action: ProposedAction) => (
    <label key={action.effectId} className="tw-flex tw-gap-3 tw-rounded-lg tw-border tw-border-gray-200 tw-p-4">
      <input
        type="checkbox"
        className="tw-mt-1"
        checked={confirmedEffects.includes(action.effectId)}
        onChange={(event) => setConfirmedEffects((selected) => (
          event.target.checked
            ? [...selected, action.effectId]
            : selected.filter((id) => id !== action.effectId)
        ))}
      />
      <span>
        <span className="tw-block tw-font-semibold tw-text-gray-900">{action.label}</span>
        <span className="tw-mt-1 tw-block tw-text-sm tw-text-gray-600">{action.bodyMarkdown}</span>
      </span>
    </label>
  );

  const renderOutcome = () => {
    if (busy && !resolved) return <p className="tw-text-gray-600">Preparing the outcome…</p>;
    if (!resolved) return null;
    if (record?.fulfillmentMode === 'PDF_UPLOAD') {
      return (
        <div>
          <h2 className="tw-text-2xl tw-font-semibold">Service record created</h2>
          <p className="tw-mt-2 tw-text-gray-600">The instruction sheet is already saved. Add the completed PDF when ready.</p>
          {pdfUpload(String(resolved.components.find((item) => item.key === 'pdf-upload')?.config.label || 'Completed application PDF'))}
          <div className="tw-mt-5 tw-flex tw-justify-end">
            <button type="button" className="btn btn-primary" disabled={!pdf || busy} onClick={finishPdf}>
              {busy ? 'Saving…' : 'Save PDF and finish'}
            </button>
          </div>
        </div>
      );
    }
    if (record?.fulfillmentMode === 'INSTRUCTIONS_ONLY') {
      return (
        <div className="tw-rounded-lg tw-border tw-border-green-200 tw-bg-green-50 tw-p-6">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-green-950">Service recorded</h2>
          <p className="tw-mt-2 tw-text-green-900">The client instruction sheet was saved to the service record.</p>
          <button type="button" className="btn btn-primary tw-mt-5" onClick={backToApplications}>Return to applications</button>
        </div>
      );
    }
    let createLabel = 'Save service';
    if (busy) createLabel = 'Creating service record…';
    else if (resolved.fulfillmentMode === 'WEB_FORM') createLabel = 'Continue to application';
    return (
      <div>
        <div className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-p-5">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-950">{resolved.serviceTitle}</h2>
          <h3 className="tw-mt-5 tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">Worker instructions</h3>
          <div className="tw-prose tw-prose-sm tw-mt-2 tw-max-w-none"><ReactMarkdown>{resolved.workerInstructionsMarkdown}</ReactMarkdown></div>
        </div>
        {resolved.proposedActions.length > 0 && (
          <div className="tw-mt-5 tw-grid tw-gap-3">
            <h3 className="tw-font-semibold tw-text-gray-900">Confirm suggested case actions</h3>
            {resolved.proposedActions.map(actionToggle)}
          </div>
        )}
        <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-between tw-gap-3">
          <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={resolved.fulfillmentMode === 'WEB_FORM' ? () => startWebForm() : createOutcomeRecord}
          >
            {createLabel}
          </button>
        </div>
      </div>
    );
  };

  const renderManual = () => {
    if (record?.fulfillmentMode === 'PDF_UPLOAD') {
      return (
        <div>
          <h2 className="tw-text-2xl tw-font-semibold">Manual service record created</h2>
          {pdfUpload()}
          <button type="button" className="btn btn-primary tw-mt-5" disabled={!pdf || busy} onClick={finishPdf}>Save PDF and finish</button>
        </div>
      );
    }
    if (record) {
      return (
        <div className="tw-rounded-lg tw-border tw-border-green-200 tw-bg-green-50 tw-p-6">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-green-950">Manual service recorded</h2>
          <p className="tw-mt-2 tw-text-green-900">The authored instruction sheet is saved for {clientName || clientUsername}.</p>
          <button type="button" className="btn btn-primary tw-mt-5" onClick={backToApplications}>Return to applications</button>
        </div>
      );
    }
    return (
      <div className="tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-p-5 tw-shadow-sm">
        <div className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
          <div>
            <h2 className="tw-text-2xl tw-font-semibold tw-text-slate-950">Record a case outside the tree</h2>
            <p className="tw-mt-1 tw-text-sm tw-text-slate-600">This creates a reportable manual classification and preserves the path attempted so far.</p>
          </div>
          <button type="button" className="btn btn-outline-dark" onClick={() => setManualMode(false)}>Return to tree</button>
        </div>
        <div className="tw-mt-5 tw-grid tw-gap-4 md:tw-grid-cols-2">
          <label className="tw-font-medium">Service title
            <input className="form-control tw-mt-1" value={manual.serviceTitle} onChange={(event) => setManual({ ...manual, serviceTitle: event.target.value })} />
          </label>
          <label className="tw-font-medium">Why the tree did not fit
            <select className="form-control tw-mt-1" value={manual.manualReason} onChange={(event) => setManual({ ...manual, manualReason: event.target.value as typeof manual.manualReason })}>
              <option value="NO_MATCH">No matching case</option>
              <option value="UNSURE">Worker was unsure</option>
              <option value="URGENT_BYPASS">Urgent bypass</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="tw-font-medium md:tw-col-span-2">Additional context
            <input className="form-control tw-mt-1" value={manual.manualReasonDetail} onChange={(event) => setManual({ ...manual, manualReasonDetail: event.target.value })} />
          </label>
          <label className="tw-font-medium">What happens next
            <select className="form-control tw-mt-1" value={manual.fulfillmentMode} onChange={(event) => setManual({ ...manual, fulfillmentMode: event.target.value as FulfillmentMode })}>
              <option value="INSTRUCTIONS_ONLY">Instructions only</option>
              <option value="PDF_UPLOAD">Upload a completed PDF</option>
              <option value="WEB_FORM">Continue to an application form</option>
            </select>
          </label>
          {manual.fulfillmentMode === 'WEB_FORM' && (
            <label className="tw-font-medium">Application
              <select className="form-control tw-mt-1" value={manual.registryEntryId} onChange={(event) => setManual({ ...manual, registryEntryId: event.target.value })}>
                <option value="">Choose an application</option>
                {availableApplications.map((application) => <option key={application.applicationId} value={application.applicationId}>{application.label}</option>)}
              </select>
            </label>
          )}
          <label className="tw-font-medium md:tw-col-span-2">Client instruction Markdown
            <textarea rows={8} className="form-control tw-mt-1 tw-font-mono" value={manual.clientInstructionsMarkdown} onChange={(event) => setManual({ ...manual, clientInstructionsMarkdown: event.target.value })} />
          </label>
          <label className="tw-font-medium md:tw-col-span-2">Worker instruction Markdown (optional)
            <textarea rows={4} className="form-control tw-mt-1 tw-font-mono" value={manual.workerInstructionsMarkdown} onChange={(event) => setManual({ ...manual, workerInstructionsMarkdown: event.target.value })} />
          </label>
        </div>
        <div className="tw-mt-4 tw-flex tw-items-center tw-justify-between tw-gap-3">
          <button type="button" className="btn btn-outline-dark" onClick={toggleManualPreview}>{manualPreview ? 'Hide preview' : 'Preview sheet'}</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={createManualRecord}>{busy ? 'Creating…' : 'Create manual service'}</button>
        </div>
        {manualPreview && (
          <div className="tw-mt-5 tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white">
            <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-slate-200 tw-bg-slate-50 tw-px-5 tw-py-3">
              <span className="tw-text-sm tw-font-semibold tw-text-slate-800">Client instruction sheet preview</span>
              <span className="tw-rounded-full tw-bg-white tw-px-2.5 tw-py-1 tw-text-xs tw-font-medium tw-text-slate-500 tw-ring-1 tw-ring-slate-200">Print / PDF</span>
            </div>
            <div className="tw-prose tw-prose-sm tw-max-w-none tw-p-6">
              <ReactMarkdown>{manualPreview}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tw-mx-auto tw-w-full tw-max-w-5xl tw-px-4 tw-py-6">
      <HomelessnessDefinitionModal
        isOpen={homelessnessDefinitionOpen}
        onClose={() => setHomelessnessDefinitionOpen(false)}
      />
      <div className="tw-mb-6 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-4">
        <div>
          <button type="button" className="btn btn-outline-dark tw-mb-4" onClick={backToApplications}>← Applications</button>
          <h1 className="tw-text-4xl tw-font-semibold tw-text-gray-950">{flow?.title || 'Client case picker'}</h1>
        </div>
        {!record && !manualMode && (
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {path.length > 0 && (
              <button type="button" className="btn btn-outline-secondary" onClick={reset}>Start over</button>
            )}
            <button type="button" className="btn btn-outline-primary" onClick={() => setManualMode(true)}>This case does not fit the tree</button>
          </div>
        )}
      </div>
      {error && <div className="alert alert-danger tw-mb-5">{error}</div>}
      {!flow && !error && <p className="tw-text-gray-600">Loading the published case tree…</p>}
      {manualMode ? renderManual() : currentNode && (
        <div>
          {currentNode.type !== 'OUTCOME' && (
            <div className="tw-mb-5">
              <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-950">{currentNode.question}</h2>
              {currentNode.description && <div className="tw-prose tw-prose-sm tw-mt-2 tw-max-w-none tw-text-gray-600"><ReactMarkdown remarkPlugins={[remarkGfm]} components={descriptionMarkdownComponents}>{currentNode.description}</ReactMarkdown></div>}
            </div>
          )}
          {(currentNode.type === 'CHOICE' || currentNode.type === 'INTERACTION') && renderChoice(currentNode)}
          {currentNode.type === 'OUTCOME' && renderOutcome()}
        </div>
      )}
    </div>
  );
};

export default ApplicationSelectorFlow;
