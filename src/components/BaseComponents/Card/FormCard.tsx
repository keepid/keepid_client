import { Divider } from 'antd';
import React from 'react';
import { Card, Container } from 'react-bootstrap';

type FormCardProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
};

const FormCard = ({ children, title }: FormCardProps) => (
  <Card
    style={{
      background: '#FFFFFF',
      /* Primary Purple */
      border: '1px solid #445FEB',
      boxSizing: 'border-box',
      borderRadius: '20px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Divider><h2>{title}</h2></Divider>
    </div>
    <Container>{children}</Container>
  </Card>
);

export default FormCard;
