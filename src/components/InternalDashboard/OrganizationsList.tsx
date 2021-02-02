import React from 'react';
import { Link } from 'react-router-dom';

import { Organization, User } from '../../types';
import Table from '../BaseComponents/Table/Table';

interface Props {
    organizations: Organization[];
    users: User[];
}

const OrganizationList = ({ organizations, users }: Props) => {
  const rows = organizations.map((o, idx) => ({
    name: <Link to={`/dashboard/orgs/${encodeURIComponent(o.orgName)}`}>{o.orgName}</Link>,
    numMembers: users.filter((u) => u.organization === o.orgName).length,
    id: `${o.orgName}|${o.creationDate}|${idx}`,
  }));

  return (
    <Table
      data={rows}
      columns={[
        {
          dataField: 'name',
          text: 'Name',
          sort: true,
          sortFunc: (_1, _2, order, name, a, b) => (order === 'asc'
            ? b.id.toLowerCase().charCodeAt(0) - a.id.toLowerCase().charCodeAt(0)
            : a.id.toLowerCase().charCodeAt(0) - b.id.toLowerCase().charCodeAt(0)),
        },
        { dataField: 'numMembers', text: 'Member Count', sort: true },
      ]}
      emptyInfo={{
        description: 'No Orgs Found',
      }}
      defaultPageSize={25}
    />
  );
};

export default OrganizationList;
