import React, { useEffect, useState } from 'react';
import { Breadcrumb, Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

import { Organization, User } from '../../types';
import DashboardAPI from './DashboardAPI';
import OrganizationList from './OrganizationsList';
import OrgDetails from './OrgDetails';
import UserDetails from './UserDetails';

const InternalDashboard = () => {
  const { orgName, username } = useParams();
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!dataFetched) {
      Promise.all([DashboardAPI.getAllOrgs(), DashboardAPI.getAllUsers()]).then(
        ([orgs, users]) => {
          setOrgs(orgs);
          setUsers(users);
          setDataFetched(true);
        },
      );
    }
  });

  const renderOrgDetails = () => {
    const org = orgs.find((o) => o.orgName === orgName);
    if (org) {
      return (
        <OrgDetails
          organization={org}
          members={users.filter((u) => u.organization === org.orgName)}
        />
      );
    }
    return null;
  };

  const renderUserDetails = () => {
    const user = users.find(
      (u) => u.organization === orgName && u.username === username,
    );
    if (user) {
      return <UserDetails user={user} />;
    }
    return null;
  };

  return dataFetched ? (
    <>
      <Breadcrumb>
        <Breadcrumb.Item active={!orgName}>
          {!orgName ? (
            'Organizations'
          ) : (
            <Link to="/dashboard">Organizations</Link>
          )}
        </Breadcrumb.Item>
        {orgName ? (
          <>
            <Breadcrumb.Item active={!username}>
              {!username ? (
                orgName
              ) : (
                <Link to={`/dashboard/orgs/${encodeURIComponent(orgName)}`}>
                  {orgName}
                </Link>
              )}
            </Breadcrumb.Item>
            {username ? (
              <Breadcrumb.Item active>{username}</Breadcrumb.Item>
            ) : null}
          </>
        ) : null}
      </Breadcrumb>
      <Container>
        {/* eslint-disable-next-line no-nested-ternary */}
        {username ? (
          renderUserDetails()
        ) : orgName ? (
          renderOrgDetails()
        ) : (
          <OrganizationList organizations={orgs} users={users} />
        )}
      </Container>
    </>
  ) : null;
};

export default InternalDashboard;
