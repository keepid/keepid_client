import type { CellProps } from '@jsonforms/core';
import { isBooleanControl, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import React from 'react';

function PreviewBooleanCell(props: CellProps) {
  const { data, id, enabled, path, handleChange } = props;
  const checked = data === true;

  return (
    <div className="tw-flex tw-items-center tw-gap-4">
      <label className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-text-sm ${!enabled ? 'tw-opacity-50' : 'tw-cursor-pointer'}`}>
        <input
          type="radio"
          name={id}
          checked={checked}
          onChange={() => handleChange(path, true)}
          disabled={!enabled}
          className="tw-h-4 tw-w-4 tw-border-gray-300 tw-text-blue-600 focus:tw-ring-2 focus:tw-ring-blue-500"
        />
        Yes
      </label>
      <label className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-text-sm ${!enabled ? 'tw-opacity-50' : 'tw-cursor-pointer'}`}>
        <input
          type="radio"
          name={id}
          checked={!checked && data !== undefined}
          onChange={() => handleChange(path, false)}
          disabled={!enabled}
          className="tw-h-4 tw-w-4 tw-border-gray-300 tw-text-blue-600 focus:tw-ring-2 focus:tw-ring-blue-500"
        />
        No
      </label>
    </div>
  );
}

export const previewBooleanCellTester = rankWith(3, isBooleanControl);
export default withJsonFormsCellProps(PreviewBooleanCell);
