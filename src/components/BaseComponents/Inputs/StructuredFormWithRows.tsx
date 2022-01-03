/* eslint-disable radix */
import React, { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';

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
};

const StructuredFormWithRows = ({ onSubmit, rows, values, onPropertyChange, children }: Props) => (
  <Form onSubmit={onSubmit}>
    {rows.map((r) => (
      <Row key={`form-row-${r.rowLabel}`}>
        <label className="col-sm-3 col-form-label text-sm-right">
          {r.rowLabel}
        </label>
        {r.fields.map((f) => (
          <Col>
            <InputFromField
              key={`input-${f.name}`}
              field={f}
              onChange={(value) => onPropertyChange(f.name, value)}
              value={values[f.name]}
            />
          </Col>
        ))}
      </Row>
    ))}
    {children}
  </Form>
);

export default StructuredFormWithRows;
