/* eslint-disable radix */
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import { BaseInputFieldType } from './FieldType';
import InputFromField from './InputFromField';

export type FormRowType = {
  fields: BaseInputFieldType<any>[];
  rowLabel: string;
};

type Props = {
  rows: FormRowType[];
  onSubmit: (e: any) => void;
  onPropertyChange: (name: string, value: any) => void;
  values: Record<string, any>;
  children?: JSX.Element | JSX.Element[];
  labelClassName?: string;
};

export default function StructuredFormWithRows({
  onSubmit,
  rows,
  values,
  labelClassName,
  onPropertyChange,
  children,
}: Props) {
  return (
    <Form onSubmit={onSubmit}>
      {rows.map((r) => (
        <Row key={`form-row-${r.rowLabel}`} className="text-end">
          <p className="col-sm-3 col-form-label tw-mx-2 tw-my-3">{r.rowLabel}</p>
          {r.fields.map((f) => (
            <Col key={`input-${f.name}`}>
              <InputFromField
                field={f}
                onChange={(value) => onPropertyChange(f.name, value)}
                value={values[f.name]}
                labelClassName={labelClassName}
              />
            </Col>
          ))}
        </Row>
      ))}
      {children}
    </Form>
  );
}
