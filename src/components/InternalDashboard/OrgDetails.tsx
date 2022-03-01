import { Divider, PageHeader } from 'antd';
import React, { useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { Link, useParams } from 'react-router-dom';

import { Organization, User } from '../../types';
import { OrganizationProperties } from '../../types/Organization';
import Table from '../BaseComponents/Table/Table';
import CreateUserModal from './CreateUserModal';
import DashboardAPI from './DashboardAPI';
import EntityEditForm from './EntityEditForm';

interface Props {
  alert: any;
  organization: Organization;
}

const OrgDetails = ({ alert, organization: _org }: Props) => {
  const { username } = useParams();

  const [organization, setOrganization] = useState(_org);
  const [members, setMembers] = useState<User[]>([]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  useEffect(() => {
    if (!dataFetched) {
      DashboardAPI.getOrganizationUsers(organization.id)
        .then((users) => {
          setDataFetched(true);
          setMembers(users);
        })
        .catch((err) => {
          alert.show("Failed to fetch Org's members", { type: 'error' });
          setDataFetched(false);
        });
    }
  });
  return (
    <div>
      <PageHeader title={organization.orgName} />

      <EntityEditForm
        entity={organization}
        fields={OrganizationProperties}
        title="Organization Info"
        onChange={(prop, val) =>
          setOrganization({ ...organization, [prop]: val })
        }
        onSubmit={() =>
          DashboardAPI.updateOrganization(organization)
            .then((u) => setOrganization(u))
            .catch((err) => {
              console.error(err);
              alert.show('Failed updating User, please try again.', {
                type: 'error',
              });
            })
        }
        onDelete={() => {
          console.log('Deleting');
          return DashboardAPI.deleteOrganization(organization).catch((err) => {
            console.error(err);
            alert.show('Failed deleting User, please try again.', {
              type: 'error',
            });
          });
        }}
      />

      <Divider>Members</Divider>
      <CreateUserModal
        orgName={organization.orgName}
        onHide={() => setDataFetched(false)}
      />
      <Table
        data={members.map((m, idx) => ({
          name: (
            <Link
              to={`/dashboard/orgs/${encodeURIComponent(
                organization.orgName,
              )}/users/${encodeURIComponent(m.username)}`}
            >
              {[m.firstName, m.lastName].join(' ')}
            </Link>
          ),
          type: m.privilegeLevel,
          email: m.email,
          id: `${m.firstName}|${m.lastName}|${m.email}|${idx}`,
        }))}
        columns={[
          {
            dataField: 'name',
            text: 'Name',
            sort: true,
            sortFunc: (_1, _2, order, name, a, b) =>
              order === 'desc'
                ? b.id.toLowerCase().charCodeAt(0) -
                  a.id.toLowerCase().charCodeAt(0)
                : a.id.toLowerCase().charCodeAt(0) -
                  b.id.toLowerCase().charCodeAt(0),
          },
          {
            dataField: 'email',
            text: 'Email',
            sort: true,
          },
          { dataField: 'type', text: 'User Type', sort: true },
        ]}
        emptyInfo={{
          description: 'No Members for org',
        }}
      />
    </div>
  );
};

export default withAlert()(OrgDetails);
