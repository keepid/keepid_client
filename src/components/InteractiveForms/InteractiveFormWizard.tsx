import type { UISchemaElement } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import React, { useCallback, useState } from 'react';

import { normalizeDateLikeValue, resolveDirectiveFromProfilesForTarget } from '../../utils/directives';
import { WizardSubmitProvider } from './InteractiveFormWizardContext';
import { interactiveFormCells, interactiveFormRenderers } from './renderers';
import { type AutoFillField, type BuilderState, type OutputFieldDefinition, computeMetadata } from './types';
import { extractDirectivesFromUiSchema, normalizeTextFieldValues, useInteractiveForm } from './useInteractiveForm';

export function applyAutoFillFields(
  pdfFill: Record<string, unknown>,
  autoFillFields: AutoFillField[] | undefined,
  resolvedProfiles: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!autoFillFields || autoFillFields.length === 0) return pdfFill;
  const merged = { ...pdfFill };
  autoFillFields.forEach((af) => {
    if (!af.pdfFieldName) return;
    if (af.fieldType === 'checkbox') {
      merged[af.pdfFieldName] = typeof af.value === 'string' && af.value.trim() !== '' ? af.value : 'true';
      return;
    }
    let val: unknown;
    if (af.valueSource === 'directive' && af.value) {
      val = resolveDirectiveFromProfilesForTarget(af.value, resolvedProfiles as never, af.pdfFieldName);
    } else if (af.valueSource === 'literal') {
      val = af.value;
    }
    if (val !== undefined && val !== null && val !== '') {
      merged[af.pdfFieldName] = normalizeDateLikeValue(val);
    }
  });
  return merged;
}

export interface InteractiveFormWizardProps {
  applicationId: string;
  clientUsername?: string;
  outputFields?: OutputFieldDefinition[];
  autoFillFields?: AutoFillField[];
  onSubmit: (pdfFill: Record<string, unknown>, formOutput: Record<string, unknown>, formData: Record<string, unknown>, profileUpdates: Record<string, unknown>) => void;
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
        setData(normalizeTextFieldValues(initialData, jsonSchema));
        hasAppliedInitialData.current = true;
      } else if (!initialData || Object.keys(initialData).length === 0) {
        if (lastApplicationId.current !== applicationId) {
          lastApplicationId.current = applicationId;
          setData(normalizeTextFieldValues(getInitialData(), jsonSchema));
        }
      }
    }
  }, [loading, uiSchema, resolvedProfiles, getInitialData, applicationId, initialData, jsonSchema]);
  const effectiveOutputFields = outputFields ?? builderState?.outputFields;
  const effectiveAutoFillFields = autoFillFields ?? builderState?.autoFillFields;

  React.useEffect(() => {
    if (onDebugUpdate && jsonSchema && uiSchema) {
      const base = getFormAnswers(data);
      onDebugUpdate(applyAutoFillFields(base, effectiveAutoFillFields, resolvedProfiles));
    }
  }, [data, getFormAnswers, jsonSchema, uiSchema, onDebugUpdate, effectiveAutoFillFields, resolvedProfiles]);

  const requestSubmit = useCallback(() => {
    const normalizedData = normalizeTextFieldValues(data, jsonSchema);
    if (normalizedData !== data) setData(normalizedData);
    const baseFill = getFormAnswers(normalizedData);
    const pdfFill = applyAutoFillFields(baseFill, effectiveAutoFillFields, resolvedProfiles);
    const metadata = computeMetadata(effectiveOutputFields, normalizedData, { pdfFill, resolvedProfiles: resolvedProfiles ?? undefined });
    const profileUpdates = uiSchema ? extractDirectivesFromUiSchema(uiSchema as Record<string, unknown>, normalizedData, jsonSchema) : {};
    const formOutput = { ...pdfFill, metadata };
    onSubmit(pdfFill, formOutput, normalizedData, profileUpdates);
  }, [data, getFormAnswers, effectiveOutputFields, effectiveAutoFillFields, onSubmit, resolvedProfiles, uiSchema, jsonSchema]);

  if (loading) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-py-16 tw-text-lg tw-text-gray-600">
        Loading form...
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-p-8 tw-text-center">
        <p className="tw-text-lg tw-text-red-600">{error}</p>
      </div>
    );
  }

  if (!jsonSchema || !uiSchema) {
    return (
      <div className="tw-p-8 tw-text-center tw-text-lg tw-text-gray-600">
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
            if (newData != null) setData(normalizeTextFieldValues(newData, jsonSchema));
          }}
        />
      </div>
    </WizardSubmitProvider>
  );
}
