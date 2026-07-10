import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { useHistory } from 'react-router-dom';

import {
  applicationSelectorFlowDefinition,
  loadApplicationSelectorFlow,
  loadApplicationSelectorProfileAnswers,
} from './flowApi';
import {
  getNextRenderableStepIndex,
  getPreviousRenderableStepIndex,
  getRenderableStepNumber,
} from './flowLogic';
import { resolveApplicationSelectorOutcome } from './outcomeResolver';
import type {
  ApplicationSelectorAnswers,
  ApplicationSelectorFlowDefinition,
  ApplicationSelectorOption,
  ApplicationSelectorOutcome,
  ApplicationSelectorQuestion,
  RegistryApplicationOption,
} from './types';

interface Props {
  availableApplications: RegistryApplicationOption[];
  clientUsername?: string;
  clientName?: string;
  onUploadPdf: (file: File, outcome: ApplicationSelectorOutcome) => Promise<void>;
}

const ApplicationSelectorFlow = ({
  availableApplications,
  clientUsername,
  clientName,
  onUploadPdf,
}: Props) => {
  const history = useHistory();
  const [flow, setFlow] = useState<ApplicationSelectorFlowDefinition>(applicationSelectorFlowDefinition);
  const [answers, setAnswers] = useState<ApplicationSelectorAnswers>({});
  const [profileAnswers, setProfileAnswers] = useState<ApplicationSelectorAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const loadFlow = async () => {
      const loadedFlow = await loadApplicationSelectorFlow();
      const loadedProfileAnswers = await loadApplicationSelectorProfileAnswers(loadedFlow, clientUsername)
        .catch(() => ({}));
      if (!isActive) return;
      setFlow(loadedFlow);
      setProfileAnswers(loadedProfileAnswers);
      setAnswers(loadedProfileAnswers);
      setStepIndex(getNextRenderableStepIndex(loadedFlow, loadedProfileAnswers, 0, loadedProfileAnswers));
      setLoadError(null);
      setIsLoading(false);
    };

    loadFlow()
      .catch(() => {
        if (!isActive) return;
        const fallbackAnswers: ApplicationSelectorAnswers = {};
        setFlow(applicationSelectorFlowDefinition);
        setProfileAnswers(fallbackAnswers);
        setAnswers(fallbackAnswers);
        setStepIndex(getNextRenderableStepIndex(
          applicationSelectorFlowDefinition,
          fallbackAnswers,
          0,
          fallbackAnswers,
        ));
        setLoadError('Could not load client profile answers.');
        setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [clientUsername]);

  const currentQuestion = flow.questions[stepIndex];
  const isOutcomeStep = stepIndex >= flow.questions.length;
  const outcome = useMemo(
    () => resolveApplicationSelectorOutcome(flow, answers),
    [answers, flow],
  );
  const currentStepNumber = getRenderableStepNumber(flow, answers, stepIndex, profileAnswers);

  const goBackToApplications = () => {
    history.push({
      pathname: '/applications',
      state: {
        clientUsername: clientUsername || '',
        clientName: clientName || '',
      },
    });
  };

  const goToNextStep = (nextAnswers: ApplicationSelectorAnswers = answers) => {
    setStepIndex(getNextRenderableStepIndex(flow, nextAnswers, stepIndex + 1, profileAnswers));
  };

  const handleAnswer = (question: ApplicationSelectorQuestion, option: ApplicationSelectorOption) => {
    const nextAnswers = {
      ...answers,
      [question.id]: option.value,
    };
    setAnswers(nextAnswers);
    setUploadFile(null);
    setUploadError(null);
    goToNextStep(nextAnswers);
  };

  const startOver = () => {
    setAnswers(profileAnswers);
    setStepIndex(getNextRenderableStepIndex(flow, profileAnswers, 0, profileAnswers));
  };

  const goToPreviousStep = () => {
    const previousStepIndex = getPreviousRenderableStepIndex(
      flow,
      answers,
      stepIndex >= flow.questions.length ? flow.questions.length - 1 : stepIndex - 1,
      profileAnswers,
    );
    if (previousStepIndex === null) {
      goBackToApplications();
      return;
    }
    setStepIndex(previousStepIndex);
  };

  const getPresetApplication = (selectedOutcome: ApplicationSelectorOutcome) => {
    const registryMatch = availableApplications.find(
      (application) => application.applicationId === selectedOutcome.applicationId,
    );

    return {
      applicationId: selectedOutcome.applicationId || '',
      label: registryMatch?.label || selectedOutcome.applicationLabel || selectedOutcome.title,
      state: registryMatch?.state || '',
      idType: registryMatch?.idType || '',
      housingStatus: registryMatch?.housingStatus || '',
    };
  };

  const startAnnotatedApplication = (selectedOutcome: ApplicationSelectorOutcome) => {
    if (!selectedOutcome.applicationId) return;

    history.push({
      pathname: '/applications/createnew',
      state: {
        clientUsername: clientUsername || '',
        clientName: clientName || '',
        presetApplication: getPresetApplication(selectedOutcome),
        startAtReview: true,
        selectorInstructionsMarkdown: selectedOutcome.instructionsMarkdown || '',
      },
    });
  };

  const renderIncludedComponent = (componentName: string) => {
    if (componentName === 'blueBox') {
      return (
        <div
          key={componentName}
          className="tw-h-36 tw-rounded-md tw-bg-blue-500"
          aria-label="Blue placeholder box"
        />
      );
    }

    return (
      <div
        key={componentName}
        className="tw-h-36 tw-rounded-md tw-bg-blue-500"
        aria-label={`${componentName} placeholder box`}
      />
    );
  };

  const renderQuestion = (question: ApplicationSelectorQuestion) => {
    if (question.type === 'componentPage') {
      return (
        <div>
          <div className="tw-mb-5">
            <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-900">{question.title}</h2>
            {question.description && (
              <p className="tw-mt-2 tw-text-sm tw-text-gray-600">{question.description}</p>
            )}
          </div>
          <div className="tw-grid tw-gap-4">
            {(question.includeComponents || []).map(renderIncludedComponent)}
          </div>
          <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-between tw-gap-3">
            <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => goToNextStep()}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="tw-mb-5">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-900">{question.title}</h2>
          {question.description && (
            <p className="tw-mt-2 tw-text-sm tw-text-gray-600">{question.description}</p>
          )}
        </div>
        <div className="tw-grid tw-gap-3 md:tw-grid-cols-3">
          {(question.options || []).map((option) => {
            const isSelected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={[
                  'tw-flex tw-h-full tw-min-h-52 tw-w-full tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-rounded-md tw-border tw-bg-white tw-p-5 tw-text-center tw-shadow-sm tw-transition hover:tw-border-blue-400 hover:tw-bg-blue-50',
                  isSelected ? 'tw-border-blue-500 tw-ring-2 tw-ring-blue-200' : 'tw-border-gray-200',
                ].join(' ')}
                onClick={() => handleAnswer(question, option)}
              >
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt=""
                    className="tw-h-28 tw-w-36 tw-max-w-full tw-shrink-0 tw-object-contain"
                    aria-hidden="true"
                  />
                )}
                <span className="tw-min-w-0">
                  <span className="tw-block tw-text-base tw-font-semibold tw-text-gray-900">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="tw-mt-2 tw-block tw-text-sm tw-leading-6 tw-text-gray-600">
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div className="tw-mt-6 tw-flex tw-justify-between">
          <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
            Back
          </button>
        </div>
      </div>
    );
  };

  const handlePdfSelection = (file?: File | null) => {
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);
  };

  const clearUploadFile = () => {
    setUploadFile(null);
    setUploadError(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const handlePdfDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingPdf(false);
    handlePdfSelection(event.dataTransfer.files?.[0]);
  };

  const uploadOutcomePdf = async (selectedOutcome: ApplicationSelectorOutcome) => {
    if (!uploadFile) {
      setUploadError('Choose a PDF to upload.');
      return;
    }
    setIsUploadingPdf(true);
    setUploadError(null);
    try {
      await onUploadPdf(uploadFile, selectedOutcome);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload PDF.');
      setIsUploadingPdf(false);
    }
  };

  const renderPdfDropBox = (selectedOutcome: ApplicationSelectorOutcome) => (
    <div className="tw-mt-6">
      <div className="tw-relative">
        <label
          htmlFor="application-selector-pdf-upload"
          className={[
            'tw-flex tw-min-h-44 tw-cursor-pointer tw-flex-col tw-items-center tw-justify-center tw-rounded-md tw-border-2 tw-p-6 tw-text-center tw-transition',
            uploadFile ? 'tw-border-solid tw-border-green-500 tw-bg-green-50' : 'tw-border-dashed',
            isDraggingPdf
              ? 'tw-border-blue-600 tw-bg-blue-100'
              : !uploadFile && 'tw-border-blue-300 tw-bg-blue-50',
          ].filter(Boolean).join(' ')}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingPdf(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDraggingPdf(false)}
          onDrop={handlePdfDrop}
        >
          {uploadFile ? (
            <>
              <span className="tw-mb-3 tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-full tw-bg-green-100 tw-text-green-700">
                <i className="fas fa-check" aria-hidden />
              </span>
              <span className="tw-max-w-full tw-break-words tw-text-base tw-font-semibold tw-text-green-950">
                {uploadFile.name}
              </span>
              <span className="tw-mt-2 tw-text-sm tw-text-green-900">
                PDF selected. Choose a different file to replace it.
              </span>
            </>
          ) : (
            <>
              <span className="tw-text-base tw-font-semibold tw-text-blue-950">
                Drop PDF here
              </span>
              <span className="tw-mt-2 tw-text-sm tw-text-blue-900">
                or choose a file
              </span>
            </>
          )}
          <input
            ref={pdfInputRef}
            id="application-selector-pdf-upload"
            type="file"
            accept="application/pdf,.pdf"
            className="tw-sr-only"
            onChange={(event) => handlePdfSelection(event.target.files?.[0])}
          />
        </label>
        {uploadFile && (
          <button
            type="button"
            className="tw-absolute tw-right-3 tw-top-3 tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-bold tw-text-gray-600 tw-shadow-sm hover:tw-bg-gray-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            onClick={clearUploadFile}
            aria-label={`Remove ${uploadFile.name}`}
          >
            <span aria-hidden="true">x</span>
          </button>
        )}
      </div>
      {uploadError && (
        <div className="alert alert-danger py-2 tw-mt-3">{uploadError}</div>
      )}
      <div className="tw-mt-4 tw-flex tw-flex-wrap tw-justify-between tw-gap-3">
        <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => uploadOutcomePdf(selectedOutcome)}
          disabled={isUploadingPdf || !uploadFile}
        >
          {isUploadingPdf ? 'Uploading...' : selectedOutcome.uploadLabel || 'Upload PDF'}
        </button>
      </div>
    </div>
  );

  const renderOutcome = () => {
    if (!outcome) {
      return (
        <div className="tw-rounded-md tw-border tw-border-yellow-200 tw-bg-yellow-50 tw-p-4">
          <h2 className="tw-text-xl tw-font-semibold tw-text-yellow-950">No matching outcome</h2>
          <p className="tw-mt-2 tw-text-sm tw-text-yellow-900">
            This answer combination is not listed in the selector flow.
          </p>
          <div className="tw-mt-4 tw-flex tw-flex-wrap tw-gap-3">
            <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={startOver}>
              Start over
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="tw-mb-5">
          <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-900">{outcome.title}</h2>
        </div>
        {outcome.instructionsMarkdown && (
          <div className="tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-p-4">
            <div className="tw-prose tw-prose-sm tw-max-w-none tw-text-gray-700 tw-prose-headings:tw-text-gray-900 tw-prose-a:tw-text-blue-600">
              <ReactMarkdown>{outcome.instructionsMarkdown}</ReactMarkdown>
            </div>
          </div>
        )}
        {(outcome.includeComponents || []).length > 0 && (
          <div className="tw-mt-4 tw-grid tw-gap-4">
            {outcome.includeComponents.map(renderIncludedComponent)}
          </div>
        )}
        {outcome.applicationId ? (
          <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-between tw-gap-3">
            <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => startAnnotatedApplication(outcome)}
            >
              Next
            </button>
          </div>
        ) : (
          renderPdfDropBox(outcome)
        )}
      </div>
    );
  };

  return (
    <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
      <div className="tw-mt-3 tw-mb-5 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
        <button type="button" className="btn btn-primary mr-2" onClick={goBackToApplications}>
          <i className="fas fa-chevron-left tw-mr-1" aria-hidden />
          Applications
        </button>
      </div>
      <div className="tw-mb-6">
        <h1 className="tw-text-4xl tw-font-semibold tw-text-gray-900">{flow.title}</h1>
        {flow.description && (
          <p className="tw-mt-2 tw-max-w-3xl tw-text-sm tw-leading-6 tw-text-gray-600">
            {flow.description}
          </p>
        )}
        {loadError && (
          <div className="alert alert-warning py-2 tw-mt-3">{loadError}</div>
        )}
      </div>
      {isLoading ? (
        <div className="tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-p-4 tw-text-sm tw-text-gray-600">
          Loading selector...
        </div>
      ) : (
        <div className="tw-py-2">
          <div className="tw-mb-3 tw-text-sm tw-font-semibold tw-uppercase tw-text-gray-500">
            Step {currentStepNumber}
          </div>
          {isOutcomeStep ? renderOutcome() : currentQuestion && renderQuestion(currentQuestion)}
        </div>
      )}
    </div>
  );
};

export default ApplicationSelectorFlow;
