import type { UISchemaElement } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import React, { useCallback, useState } from 'react';

import { resolveDirectiveFromProfiles } from '../../utils/directives';
import { WizardSubmitProvider } from './InteractiveFormWizardContext';
import { interactiveFormCells, interactiveFormRenderers } from './renderers';
import { type AutoFillField, type BuilderState, type OutputFieldDefinition, computeMetadata } from './types';
import { useInteractiveForm } from './useInteractiveForm';

function applyAutoFillFields(
  pdfFill: Record<string, unknown>,
  autoFillFields: AutoFillField[] | undefined,
  resolvedProfiles: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!autoFillFields || autoFillFields.length === 0) return pdfFill;
  const merged = { ...pdfFill };
  autoFillFields.forEach((af) => {
    if (!af.pdfFieldName) return;
    if (af.fieldType === 'checkbox') {
      // Optional override for non-standard encodings: allow explicit token
      // (e.g. Choice2-...) instead of generic "true".
      merged[af.pdfFieldName] = af.value && af.value.trim() !== '' ? af.value : 'true';
      return;
    }
    let val: unknown;
    if (af.valueSource === 'directive' && af.value) {
      val = resolveDirectiveFromProfiles(af.value, resolvedProfiles as never);
    } else if (af.valueSource === 'literal') {
      val = af.value;
    }
    if (val !== undefined && val !== null && val !== '') {
      merged[af.pdfFieldName] = val;
    }
  });
  return merged;
}

export interface InteractiveFormWizardProps {
  applicationId: string;
  clientUsername?: string;
  outputFields?: OutputFieldDefinition[];
  autoFillFields?: AutoFillField[];
  onSubmit: (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>) => void;
  onDebugUpdate?: (formAnswers: Record<string, unknown>) => void;
  /** Called when config is loaded, so parent can access builderState (e.g. signaturePlacements) and formTitle. */
  onConfigLoaded?: (config: { builderState: BuilderState | null; formTitle: string }) => void;
  initialData?: Record<string, unknown>;
  onBack?: () => void;
}

export default function InteractiveFormWizard({
  applicationId,
  clientUsername = '',
  outputFields,
  autoFillFields,
  onSubmit,
  onDebugUpdate,
  onConfigLoaded,
  initialData,
  onBack,
}: InteractiveFormWizardProps) {
  const { loading, error, jsonSchema, uiSchema, getFormAnswers, getInitialData, resolvedProfiles, builderState, formTitle } = useInteractiveForm({
    applicationId,
    clientUsername,
  });

  React.useEffect(() => {
    if (onConfigLoaded && !loading) {
      onConfigLoaded({ builderState, formTitle });
    }
  }, [onConfigLoaded, loading, builderState, formTitle]);

  const [data, setData] = useState<Record<string, unknown>>(initialData ?? {});
  const lastApplicationId = React.useRef<string | null>(null);
  const hasAppliedInitialData = React.useRef(false);
  React.useEffect(() => {
    if (!loading && uiSchema && resolvedProfiles) {
      if (initialData && Object.keys(initialData).length > 0 && !hasAppliedInitialData.current) {
        setData(initialData);
        hasAppliedInitialData.current = true;
      } else if (!initialData || Object.keys(initialData).length === 0) {
        if (lastApplicationId.current !== applicationId) {
          lastApplicationId.current = applicationId;
          setData(getInitialData());
        }
      }
    }
  }, [loading, uiSchema, resolvedProfiles, getInitialData, applicationId, initialData]);
  const effectiveOutputFields = outputFields ?? builderState?.outputFields;
  const effectiveAutoFillFields = autoFillFields ?? builderState?.autoFillFields;

  React.useEffect(() => {
    if (onDebugUpdate && jsonSchema && uiSchema) {
      const base = getFormAnswers(data);
      onDebugUpdate(applyAutoFillFields(base, effectiveAutoFillFields, resolvedProfiles));
    }
  }, [data, getFormAnswers, jsonSchema, uiSchema, onDebugUpdate, effectiveAutoFillFields, resolvedProfiles]);

  const requestSubmit = useCallback(() => {
    const baseFill = getFormAnswers(data);
    const pdfFill = applyAutoFillFields(baseFill, effectiveAutoFillFields, resolvedProfiles);
    const metadata = computeMetadata(effectiveOutputFields, data, { pdfFill, resolvedProfiles: resolvedProfiles ?? undefined });
    const formOutput = { ...pdfFill, metadata };
    onSubmit(pdfFill, formOutput, data);
  }, [data, getFormAnswers, effectiveOutputFields, effectiveAutoFillFields, onSubmit, resolvedProfiles]);

  if (loading) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-py-12 tw-text-gray-500">
        Loading form...
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-p-6 tw-text-center">
        <p className="tw-text-red-600">{error}</p>
      </div>
    );
  }

  if (!jsonSchema || !uiSchema) {
    return (
      <div className="tw-p-6 tw-text-center tw-text-gray-500">
        No form configuration found for this application.
      </div>
    );
  }

  return (
    <WizardSubmitProvider requestSubmit={requestSubmit} onBack={onBack} startAtLastStep={!!(initialData && Object.keys(initialData).length > 0)}>
      <div className="form-preview">
        <JsonForms
          schema={jsonSchema}
          uischema={uiSchema as unknown as UISchemaElement}
          data={data}
          renderers={interactiveFormRenderers}
          cells={interactiveFormCells}
          onChange={({ data: newData }) => {
            if (newData != null) setData(newData);
          }}
        />
      </div>
    </WizardSubmitProvider>
  );
}
