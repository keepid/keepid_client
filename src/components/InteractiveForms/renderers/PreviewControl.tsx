import type { ControlProps, JsonSchema } from '@jsonforms/core';
import { computeLabel, isControl, isDescriptionHidden, NOT_APPLICABLE, rankWith } from '@jsonforms/core';
import { Control, DispatchCell, withJsonFormsControlProps } from '@jsonforms/react';
import React from 'react';

class PreviewControl extends Control<ControlProps, { isFocused: boolean }> {
  state = { isFocused: false };

  render() {
    const {
      description,
      id,
      errors,
      label,
      uischema,
      schema,
      rootSchema,
      visible,
      enabled,
      required,
      path,
      cells,
      config,
    } = this.props;

    const isValid = errors.length === 0;
    const schemaObj = schema as JsonSchema;
    const hasEnum = schemaObj && (Array.isArray((schemaObj as Record<string, unknown>).enum));
    const format = uischema.options && (uischema.options as Record<string, unknown>).format;
    const isRadioFormat = format === 'radio' || (hasEnum && format !== 'select');

    const appliedUiSchemaOptions = { ...config, ...uischema.options };
    const showDescription = !isDescriptionHidden(
      visible,
      description,
      this.state.isFocused,
      appliedUiSchemaOptions.showUnfocusedDescription,
    );
    const testerContext = { rootSchema, config };
    const { bestCell } = cells.reduce<{ bestScore: number; bestCell: typeof cells[0] | null }>(
      (acc, r) => {
        const score = r.tester(uischema, schema, testerContext);
        if (score !== NOT_APPLICABLE && score > acc.bestScore) {
          return { bestScore: score, bestCell: r };
        }
        return acc;
      },
      { bestScore: -1, bestCell: null },
    );
    const cell = bestCell;

    if (!cell || cell.tester(uischema, schema, testerContext) === NOT_APPLICABLE) {
      return null;
    }

    const enumValues = hasEnum ? ((schemaObj as Record<string, unknown>).enum as string[]) : [];
    const enumNames = hasEnum ? ((schemaObj as Record<string, unknown>).enumNames as string[] | undefined) : undefined;
    const currentValue = this.props.data;

    if (hasEnum && isRadioFormat) {
      return (
        <div className="form-preview-control tw-mb-6 tw-flex tw-flex-col" hidden={!visible} id={id}>
          <span className="tw-block tw-text-base tw-font-semibold tw-text-gray-800 tw-mb-3">
            {computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
          </span>
          <div className="tw-flex tw-flex-col tw-flex-nowrap tw-gap-3">
            {enumValues.map((val, i) => (
              <label key={val} className={`tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-gray-600 tw-w-full ${!enabled ? 'tw-opacity-50' : 'tw-cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`${id}-radio`}
                  checked={currentValue === val}
                  onChange={() => this.props.handleChange(path, val)}
                  disabled={!enabled}
                  className="tw-h-4 tw-w-4 tw-shrink-0 tw-border-gray-300 tw-text-blue-600 focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <span className="tw-block">{enumNames?.[i] || val}</span>
              </label>
            ))}
          </div>
          <div className={(() => {
            if (!isValid) return 'tw-text-sm tw-text-red-600 tw-mt-1';
            return showDescription ? 'tw-text-sm tw-text-gray-500 tw-mt-1' : '';
          })()}
          >
            {(() => {
              if (!isValid) return errors;
              return showDescription ? description : null;
            })()}
          </div>
        </div>
      );
    }

    return (
      <div
        className="form-preview-control tw-mb-6 tw-flex tw-flex-col"
        hidden={!visible}
        onFocus={() => this.setState({ isFocused: true })}
        onBlur={() => this.setState({ isFocused: false })}
        id={id}
      >
        <label htmlFor={`${id}-input`} className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
          {computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
        </label>
        <DispatchCell
          uischema={uischema}
          schema={schema}
          path={path}
          id={`${id}-input`}
          enabled={enabled}
        />
        <div className={(() => {
          if (!isValid) return 'tw-text-sm tw-text-red-600 tw-mt-2';
          return showDescription ? 'tw-text-sm tw-text-gray-500 tw-mt-2' : '';
        })()}
        >
          {(() => {
            if (!isValid) return errors;
            return showDescription ? description : null;
          })()}
        </div>
      </div>
    );
  }
}

export const previewControlTester = rankWith(2, isControl);
export default withJsonFormsControlProps(PreviewControl);
