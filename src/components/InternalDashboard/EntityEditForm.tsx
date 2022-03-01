import { Descriptions } from 'antd';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { EntityProperty } from '../../types/entityProperty';
import FormCard from '../BaseComponents/Card/FormCard';
import { DateInput } from '../BaseComponents/Inputs';

type OnFieldChange = (property: string, newValue: any) => void;

type PropTypes = {
  fields: EntityProperty[];
  entity: Record<string, any>;
  onCancel?: () => void;
  onChange: OnFieldChange;
  onDelete?: () => void;
  onSubmit: () => void;
  title: string;
  createOnly?: boolean;
};

function renderInput(f: EntityProperty, entity: any, onChange: OnFieldChange) {
  const Input = f.component;
  return (
    <Input
      key={`${f.propertyName}-input`}
      onChange={(v) => {
        const value =
          (v && v.value && v.value.toString()) || (v && v.value) || v;
        console.log(f, value);
        onChange(f.propertyName, value);
      }}
      name={f.propertyName}
      label={f.label}
      defaultValue={
        Input === DateInput && entity[f.propertyName]
          ? new Date(entity[f.propertyName])
          : entity[f.propertyName]
      }
      {...(f.inputProps || {})}
    />
  );
}

const EntityEditForm = ({
  fields,
  entity,
  onChange,
  onCancel,
  title,
  onSubmit,
  onDelete,
  createOnly,
}: PropTypes) => {
  const [isEditing, setIsEditing] = useState(false);

  const editView = (
    <Form>
      {fields
        .filter((f) => f.isEditable)
        .map((f) => renderInput(f, entity, onChange))}
    </Form>
  );

  const createView = (
    <Form>
      {fields
        .filter((f) => f.isCreatable)
        .map((f) => renderInput(f, entity, onChange))}
    </Form>
  );

  const detailView = (
    <Descriptions
      bordered
      column={{
        xxl: 2,
        xl: 2,
        lg: 2,
        md: 1,
        sm: 1,
        xs: 1,
      }}
    >
      {fields.map((f) => (
        <Descriptions.Item
          key={`${f.propertyName}-description`}
          label={<div id={`${f.propertyName}-description-label`}>{f.label}</div>}
        >
          <div id={`${f.propertyName}-description-value`}>
            {entity[f.propertyName]?.toString()}
          </div>
        </Descriptions.Item>
      ))}
    </Descriptions>
  );

  return (
    <FormCard title={title}>
      {/* eslint-disable-next-line no-nested-ternary */}
      {createOnly ? createView : isEditing ? editView : detailView}
      <div>
        {!isEditing && !createOnly ? (
          <Button
            style={{ margin: '1rem 0' }}
            onClick={() => setIsEditing(true)}
          >
            Edit Information
          </Button>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1rem 0',
              flexDirection: 'row-reverse',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                style={{ marginRight: '1rem' }}
                onClick={() => {
                  setIsEditing(false);
                  if (onCancel) {
                    onCancel();
                  }
                }}
                variant="light"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  console.log(entity);
                  if (onSubmit) {
                    onSubmit();
                  }
                }}
              >
                Save
              </Button>
            </div>
            {onDelete ? (
              <Button
                variant="danger"
                onClick={() => {
                  setIsEditing(false);
                  onDelete();
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </FormCard>
  );
};

export default EntityEditForm;
