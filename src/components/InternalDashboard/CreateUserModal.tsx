import { PageHeader } from 'antd';
import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { User, UserType } from '../../types';
import { UserCreateRequest, UserFields } from '../../types/User';
import { DateInput, SelectInput, TextInput } from '../BaseComponents/Inputs';
import DashboardAPI from './DashboardAPI';
import EntityEditForm from './EntityEditForm';

interface Props {
  alert: any;
  orgName: string;
  onHide?: () => void;
}

const CreateUserModal = ({ alert, onHide, orgName }: Props) => {
  const [user, setUser] = useState<Partial<UserCreateRequest>>({
    organization: orgName,
  });
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    if (!user.organization) {
      setUser({ ...user, organization: orgName });
    }
  });

  const onSubmit = () => DashboardAPI.createUser(user)
    .then(() => setShow(false))
    .catch((err) => {
      console.error(err);
      alert.show('Failed updating User, please try again.', {
        type: 'error',
      });
    });

  const onCancel = () => setShow(false);
  const onChange = (prop, value) => setUser({ ...user, [prop]: value });

  return (
    <div>
      <Button onClick={() => setShow(true)}>Create New User</Button>
      <Modal
        onHide={() => {
          setShow(false);
          if (onHide) {
            onHide();
          }
        }}
        show={show}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EntityEditForm fields={UserFields} entity={user} onCancel={onCancel} onChange={onChange} onSubmit={onSubmit} title="" createOnly />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default withAlert()(CreateUserModal);
