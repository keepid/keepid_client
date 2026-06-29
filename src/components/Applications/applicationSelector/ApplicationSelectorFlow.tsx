import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { loadApplicationSelectorFlow } from './flowApi';
import { resolveApplicationSelectorOutcome } from './outcomeResolver';
import { placeholderApplicationSelectorFlow } from './placeholderFlow';
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
  onOpenUpload: () => void;
}

const ApplicationSelectorFlow = ({
  availableApplications,
  clientUsername,
  clientName,
  onOpenUpload,
}: Props) => {
  const history = useHistory();
  const [flow, setFlow] = useState<ApplicationSelectorFlowDefinition>(placeholderApplicationSelectorFlow);
  const [answers, setAnswers] = useState<ApplicationSelectorAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    loadApplicationSelectorFlow()
      .then((loadedFlow) => {
        if (!isActive) return;
        setFlow(loadedFlow);
        setLoadError(null);
      })
      .catch(() => {
        if (!isActive) return;
        setFlow(placeholderApplicationSelectorFlow);
        setLoadError('Using the local placeholder selector flow.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const currentQuestion = flow.questions[stepIndex];
  const isOutcomeStep = stepIndex >= flow.questions.length;
  const outcome = useMemo(
    () => resolveApplicationSelectorOutcome(flow, answers),
    [answers, flow],
  );

  const goBackToApplications = () => {
    history.push({
      pathname: '/applications',
      state: {
        clientUsername: clientUsername || '',
        clientName: clientName || '',
      },
    });
  };

  const handleAnswer = (question: ApplicationSelectorQuestion, option: ApplicationSelectorOption) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: option.value,
    }));
    setStepIndex((previousStepIndex) => Math.min(previousStepIndex + 1, flow.questions.length));
  };

  const startOver = () => {
    setAnswers({});
    setStepIndex(0);
  };

  const goToPreviousStep = () => {
    if (stepIndex === 0) {
      goBackToApplications();
      return;
    }
    setStepIndex((previousStepIndex) => Math.max(previousStepIndex - 1, 0));
  };

  const openUploadFromOutcome = () => {
    onOpenUpload();
    goBackToApplications();
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
      },
    });
  };

  const renderIncludedComponent = (componentName: string) => {
    if (componentName === 'clientNotebox') {
      return (
        <div
          key={componentName}
          className="tw-rounded-md tw-border tw-border-blue-300 tw-bg-blue-100 tw-p-4 tw-shadow-sm"
        >
          <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-start">
            <div className="tw-flex tw-h-11 tw-w-11 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-md tw-bg-blue-600 tw-text-sm tw-font-semibold tw-text-white">
              CN
            </div>
            <div className="tw-min-w-0 tw-flex-1">
              <h3 className="tw-mb-1 tw-text-base tw-font-semibold tw-text-blue-950">
                Client notebox
              </h3>
              <p className="tw-mb-3 tw-text-sm tw-text-blue-950">
                Placeholder component box for profile-linked notes.
              </p>
              <textarea
                className="form-control tw-min-h-24 tw-border-blue-200 tw-bg-white"
                placeholder="Temporary note placeholder"
                aria-label="Client notebox placeholder"
              />
            </div>
          </div>
        </div>
      );
    }

    if (componentName === 'clientAgeInput') {
      return (
        <div
          key={componentName}
          className="tw-rounded-md tw-border tw-border-blue-300 tw-bg-blue-100 tw-p-4"
        >
          <label htmlFor="client-age-placeholder" className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-blue-950">
            Client age
          </label>
          <input
            id="client-age-placeholder"
            type="number"
            className="form-control tw-max-w-40 tw-border-blue-200"
            min="0"
            placeholder="Age"
          />
        </div>
      );
    }

    return (
      <div
        key={componentName}
        className="tw-rounded-md tw-border tw-border-blue-300 tw-bg-blue-100 tw-p-4 tw-text-sm tw-font-medium tw-text-blue-950"
      >
        {componentName}
      </div>
    );
  };

  const renderProgress = () => {
    const progressItems = [...flow.questions.map((question) => question.title), 'Outcome'];
    return (
      <div className="tw-mb-6 tw-grid tw-gap-2 sm:tw-grid-cols-4">
        {progressItems.map((label, index) => {
          const isActive = index === stepIndex || (isOutcomeStep && index === progressItems.length - 1);
          const isComplete = index < stepIndex;
          return (
            <div
              key={label}
              className={[
                'tw-rounded-md tw-border tw-px-3 tw-py-2 tw-text-xs tw-font-semibold',
                isActive ? 'tw-border-blue-500 tw-bg-blue-50 tw-text-blue-900' : '',
                isComplete ? 'tw-border-green-200 tw-bg-green-50 tw-text-green-800' : '',
                !isActive && !isComplete ? 'tw-border-gray-200 tw-bg-white tw-text-gray-500' : '',
              ].join(' ')}
            >
              {label}
            </div>
          );
        })}
      </div>
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
              onClick={() => setStepIndex(flow.questions.length)}
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
                  'tw-flex tw-h-full tw-min-h-40 tw-w-full tw-items-start tw-gap-4 tw-rounded-md tw-border tw-bg-white tw-p-4 tw-text-left tw-shadow-sm tw-transition hover:tw-border-blue-400 hover:tw-bg-blue-50',
                  isSelected ? 'tw-border-blue-500 tw-ring-2 tw-ring-blue-200' : 'tw-border-gray-200',
                ].join(' ')}
                onClick={() => handleAnswer(question, option)}
              >
                {option.iconSvgUrl && (
                  <img
                    src={option.iconSvgUrl}
                    alt=""
                    className="tw-h-10 tw-w-10 tw-shrink-0"
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

  const renderOutcome = () => {
    if (!outcome) {
      return (
        <div className="tw-rounded-md tw-border tw-border-yellow-200 tw-bg-yellow-50 tw-p-4">
          <h2 className="tw-text-xl tw-font-semibold tw-text-yellow-950">No matching outcome</h2>
          <p className="tw-mt-2 tw-text-sm tw-text-yellow-900">
            This answer combination is not listed in the placeholder flow.
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
          {outcome.applicationId ? (
            <p className="tw-mt-2 tw-text-sm tw-text-gray-600">
              This outcome starts an annotated form from the application registry.
            </p>
          ) : (
            <p className="tw-mt-2 tw-text-sm tw-text-gray-600">
              This outcome collects a completed PDF because no annotated form is mapped.
            </p>
          )}
        </div>
        <div className="tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-p-4">
          <ol className="tw-mb-0 tw-space-y-2 tw-pl-5 tw-text-sm tw-leading-6 tw-text-gray-700">
            {(outcome.instructions || []).map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </div>
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
          <div className="tw-mt-6 tw-rounded-md tw-border tw-border-dashed tw-border-blue-300 tw-bg-blue-50 tw-p-4">
            <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
              <div>
                <h3 className="tw-mb-1 tw-text-base tw-font-semibold tw-text-blue-950">
                  Upload PDF
                </h3>
                <p className="tw-mb-0 tw-text-sm tw-text-blue-900">
                  Create an application from a completed PDF for this outcome.
                </p>
              </div>
              <button type="button" className="btn btn-primary" onClick={openUploadFromOutcome}>
                {outcome.uploadLabel || 'Upload PDF'}
              </button>
            </div>
            <div className="tw-mt-4">
              <button type="button" className="btn btn-outline-dark" onClick={goToPreviousStep}>
                Back
              </button>
            </div>
          </div>
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
      {renderProgress()}
      {isLoading ? (
        <div className="tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-p-4 tw-text-sm tw-text-gray-600">
          Loading selector...
        </div>
      ) : (
        <div className="tw-py-2">
          {isOutcomeStep ? renderOutcome() : currentQuestion && renderQuestion(currentQuestion)}
        </div>
      )}
    </div>
  );
};

export default ApplicationSelectorFlow;
