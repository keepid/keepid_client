import React from 'react';
import { Button, Form } from 'react-bootstrap';

import { EntityProperty } from '../../types/entityProperty';
import FormCard from '../BaseComponents/Card/FormCard';
import { DateInput } from '../BaseComponents/Inputs';

type BasePropTypes = {
  fields: EntityProperty[];
  entity: Record<string, any>;
};

type OnFieldChange = (property: string, newValue: any) => void;

type PropTypes = BasePropTypes & {
  onChange: OnFieldChange;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
};

const EntityCreateForm = ({
  fields,
  entity,
  onChange,
  title,
  onSubmit,
  onCancel,
}: PropTypes) => (
  <FormCard title={title}>
    <Form>
      {fields.map((f) => {
        const Input = f.component;
        return (
          <Input
            key={`${f.propertyName}-input`}
            onChange={(v) => {
              console.log(f, v);
              onChange(f.propertyName, v);
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
      })}
    </Form>
    <div>
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
            onClick={onCancel}
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
      </div>
    </div>
  </FormCard>
);

export default EntityCreateForm;
