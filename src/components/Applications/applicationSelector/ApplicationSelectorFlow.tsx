import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { useHistory } from 'react-router-dom';

import getServerURL from '../../../serverOverride';
import {
  completeServiceRecord,
  createClassifiedService,
  createManualService,
  loadCaseSelector,
  previewManualService,
  resolveCaseOutcome,
  uploadServicePdf,
} from './flowApi';
import type {
  FulfillmentMode,
  ProposedAction,
  RegistryApplicationOption,
  ResolvedOutcome,
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
}

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const errorMessage = (error: unknown) => (
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'
);

const ApplicationSelectorFlow = ({
  availableApplications,
  clientUsername = '',
  clientName = '',
}: Props) => {
  const history = useHistory();
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

  const backToApplications = () => history.push({
    pathname: '/applications',
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

  const submitInteraction = () => {
    if (!currentNode) return;
    const config = currentNode.componentConfig || {};
    const isInformation = currentNode.componentKey === 'information';
    const value = fieldValue.trim();
    if (!isInformation && config.required !== false && !value) {
      setError('Enter a value to continue.');
      return;
    }
    if (currentNode.componentKey === 'penndot-number') {
      const pattern = String(config.pattern || '^\\d{8}$');
      if (value && !new RegExp(pattern).test(value)) {
        setError(String(config.helpText || 'Enter a valid 8-digit PennDOT customer number.'));
        return;
      }
    }
    const transition = currentNode.transitions[0];
    if (!transition) return;
    const next = currentNode.responseKey && !isInformation
      ? { ...responses, [currentNode.responseKey]: value }
      : responses;
    follow(transition, next);
  };

  const applicationOption = (registryEntryId?: string | null) => availableApplications.find(
    (application) => application.applicationId === registryEntryId,
  );

  const startWebForm = (created: ServiceRecordResult) => {
    const option = applicationOption(created.registryEntryId);
    if (!created.registryEntryId) return;
    history.push({
      pathname: '/applications/createnew',
      state: {
        clientUsername,
        clientName,
        serviceRecordId: created.applicationId,
        presetApplication: {
          applicationId: created.registryEntryId,
          label: option?.label || created.serviceTitle || 'Application',
          state: option?.state || '',
          idType: option?.idType || '',
          housingStatus: option?.housingStatus || '',
        },
        startAtReview: true,
        selectorInstructionsMarkdown: created.clientSheetMarkdown || resolved?.clientSheetMarkdown || '',
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
      <div className={`tw-grid tw-gap-4 ${node.transitions.length === 2 ? 'md:tw-grid-cols-2' : 'md:tw-grid-cols-3'}`}>
        {node.transitions.map((transition) => (
          <button
            key={transition.id}
            type="button"
            className="tw-flex tw-min-h-48 tw-flex-col tw-items-stretch tw-justify-center tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-p-4 tw-text-center tw-shadow-sm tw-transition hover:tw-border-blue-500 hover:tw-bg-blue-50 hover:tw-shadow-md"
            onClick={() => follow(transition)}
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
            <span className="tw-font-semibold tw-text-slate-950">{transition.label}</span>
            {transition.description && <span className="tw-mt-2 tw-text-sm tw-text-gray-600">{transition.description}</span>}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-outline-dark tw-mt-6" onClick={goBack}>Back</button>
    </div>
  );

  const renderInteraction = (node: SelectorNode) => {
    const config = node.componentConfig || {};
    const information = node.componentKey === 'information';
    const type = node.componentKey === 'date-input' ? 'date' : 'text';
    return (
      <div className="tw-max-w-2xl">
        {information ? (
          <div className="tw-rounded-lg tw-border tw-border-blue-200 tw-bg-blue-50 tw-p-5 tw-text-blue-950">
            {String(config.helpText || node.description || 'Review this information before continuing.')}
          </div>
        ) : (
          <label className="tw-block tw-font-medium tw-text-gray-900">
            {String(config.label || node.question || 'Response')}
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
        )}
        <div className="tw-mt-6 tw-flex tw-justify-between tw-gap-3">
          <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
          <button type="button" className="btn btn-primary" onClick={submitInteraction}>Continue</button>
        </div>
      </div>
    );
  };

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
    let createLabel = 'Create service record';
    if (busy) createLabel = 'Creating service record…';
    else if (resolved.fulfillmentMode === 'WEB_FORM') createLabel = 'Create record and open form';
    return (
      <div>
        <div className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-p-5">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-950">{resolved.serviceTitle}</h2>
          <div className="tw-mt-5 tw-grid tw-gap-5 lg:tw-grid-cols-2">
            <section>
              <h3 className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">Worker instructions</h3>
              <div className="tw-prose tw-prose-sm tw-mt-2 tw-max-w-none"><ReactMarkdown>{resolved.workerInstructionsMarkdown}</ReactMarkdown></div>
            </section>
            <section>
              <h3 className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">Client sheet</h3>
              <div className="tw-prose tw-prose-sm tw-mt-2 tw-max-w-none"><ReactMarkdown>{resolved.clientSheetMarkdown}</ReactMarkdown></div>
            </section>
          </div>
        </div>
        {resolved.proposedActions.length > 0 && (
          <div className="tw-mt-5 tw-grid tw-gap-3">
            <h3 className="tw-font-semibold tw-text-gray-900">Confirm suggested case actions</h3>
            {resolved.proposedActions.map(actionToggle)}
          </div>
        )}
        <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-between tw-gap-3">
          <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={createOutcomeRecord}>
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
      <div className="tw-mb-6 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-4">
        <div>
          <button type="button" className="btn btn-outline-dark tw-mb-4" onClick={backToApplications}>← Applications</button>
          <h1 className="tw-text-4xl tw-font-semibold tw-text-gray-950">{flow?.title || 'Client case picker'}</h1>
          {flow?.description && <p className="tw-mt-2 tw-max-w-3xl tw-text-gray-600">{flow.description}</p>}
        </div>
        {!record && !manualMode && (
          <button type="button" className="btn btn-outline-primary" onClick={() => setManualMode(true)}>This case does not fit the tree</button>
        )}
      </div>
      {error && <div className="alert alert-danger tw-mb-5">{error}</div>}
      {!flow && !error && <p className="tw-text-gray-600">Loading the published case tree…</p>}
      {manualMode ? renderManual() : currentNode && (
        <div>
          {currentNode.type !== 'OUTCOME' && (
            <div className="tw-mb-5">
              <div className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500">Step {path.length + 1}</div>
              <h2 className="tw-mt-2 tw-text-2xl tw-font-semibold tw-text-gray-950">{currentNode.question}</h2>
              {currentNode.description && <p className="tw-mt-2 tw-text-gray-600">{currentNode.description}</p>}
            </div>
          )}
          {currentNode.type === 'CHOICE' && renderChoice(currentNode)}
          {currentNode.type === 'INTERACTION' && renderInteraction(currentNode)}
          {currentNode.type === 'OUTCOME' && renderOutcome()}
        </div>
      )}
      {(path.length > 0 || record) && !manualMode && (
        <button type="button" className="tw-mt-10 tw-text-sm tw-font-medium tw-text-blue-700 hover:tw-underline" onClick={reset}>Start over</button>
      )}
    </div>
  );
};

export default ApplicationSelectorFlow;
