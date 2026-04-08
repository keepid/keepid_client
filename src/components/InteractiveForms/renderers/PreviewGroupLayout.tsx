import type { GroupLayout as GroupLayoutType, LayoutProps } from '@jsonforms/core';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps } from '@jsonforms/react';
import React from 'react';

const hasLabel = (label: unknown): boolean =>
  label != null && String(label).trim() !== '';

function PreviewGroupLayoutComponent({
  uischema,
  schema,
  path,
  visible,
  enabled,
  label,
}: LayoutProps) {
  const ctx = useJsonForms();
  const renderers = ctx.renderers ?? [];
  const cells = ctx.cells ?? [];
  const group = uischema as GroupLayoutType;
  const elements = group.elements ?? [];

  if (visible === false) return null;

  return (
    <fieldset className="form-preview-group tw-mb-6" hidden={visible === undefined || visible === null ? false : !visible}>
      {hasLabel(label) && (
        <legend className="form-preview-group-legend tw-block tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-5">
          {label}
        </legend>
      )}
      <div className="form-preview-group-fields tw-flex tw-flex-wrap tw-gap-8">
        {elements.map((child, index) => (
          <div key={`${path}-${(child as { scope?: string }).scope ?? `el-${index}`}`} className="form-preview-group-item tw-flex tw-flex-col tw-min-w-0 tw-flex-1">
            <JsonFormsDispatch
              renderers={renderers}
              cells={cells}
              uischema={child}
              schema={schema}
              path={path}
              enabled={enabled}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

const PreviewGroupLayout = withJsonFormsLayoutProps(PreviewGroupLayoutComponent);

export const previewGroupLayoutTester = rankWith(2, uiTypeIs('Group'));

export default PreviewGroupLayout;
