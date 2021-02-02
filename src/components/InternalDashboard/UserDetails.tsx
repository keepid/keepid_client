import { PageHeader } from 'antd';
import React, { useState } from 'react';
import { withAlert } from 'react-alert';

import { User } from '../../types';
import { UserFields } from '../../types/User';
import DashboardAPI from './DashboardAPI';
import EntityEditForm from './EntityEditForm';

interface Props {
  alert: any;
  user: User;
}

export const UserDetails = ({ alert, user: _user }: Props) => {
  const [user, _setUser] = useState<User>(_user);

  return (
    <div>
      <PageHeader title={`${user.firstName} ${user.lastName}`} />
      <EntityEditForm
        entity={user}
        fields={UserFields}
        title="User Info"
        onChange={(prop, val) => {
          _setUser({ ...user, [prop]: val });
        }}
        onSubmit={() =>
          DashboardAPI.updateUser(user)
            .then((u) => _setUser(u))
            .catch((err) => {
              console.error(err);
              alert.show('Failed updating User, please try again.', {
                type: 'error',
              });
            })
        }
        onDelete={() => {
          console.log('Deleting');
          return DashboardAPI.deleteUser(user)
            .catch((err) => {
              console.error(err);
              alert.show('Failed deleting User, please try again.', {
                type: 'error',
              });
            });
        }}
      />
    </div>
  );
};

export default withAlert()(UserDetails);
