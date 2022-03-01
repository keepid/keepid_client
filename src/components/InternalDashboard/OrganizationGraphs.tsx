import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveTreeMapHtml } from '@nivo/treemap';
import React from 'react';

import { Organization, User, UserType } from '../../types';

interface Props {
  organizations: Organization[],
  users: User[]
}

const OrganizationGraphs = ({ organizations: orgs, users }: Props) => {
  const data = {
    root: {
      name: 'Organizations',
      children: orgs.map((o) => ({
        id: o.orgName,
        color: 'hsl(128, 70%, 50%)',
        value: users.filter((u) => u.organization === o.orgName).length,
        // children: users.filter((u) => u.organization === o.orgName).map((u, idx) => ({
        //   name: [u.firstName, u.lastName, idx].join(' '),
        //   value: 1,
        //   color: 'hsl(224, 70%, 50%)',
        // })),
      })),
      color: 'hsl(23, 70%, 50%)',
    },
  };

  const pieData = orgs.map((o) => ({
    id: o.orgName,
    color: 'hsl(128, 70%, 50%)',
    value: users.filter((u) => u.organization === o.orgName).length,
  }));

  const barData = orgs.map((o) => {
    const orgUsers = users.filter((u) => u.organization === o.orgName);
    return {
      name: o.orgName,
      DIRECTOR: orgUsers.filter((u) => u.privilegeLevel === UserType.DIRECTOR).length,
      ADMIN: orgUsers.filter((u) => u.privilegeLevel === UserType.ADMIN).length,
      WORKER: orgUsers.filter((u) => u.privilegeLevel === UserType.WORKER).length,
      CLIENT: orgUsers.filter((u) => u.privilegeLevel === UserType.CLIENT).length,
      DEVELOPER: orgUsers.filter((u) => u.privilegeLevel === UserType.DEVELOPER).length,
    };
  });

  if (data.root.children.length < 1) {
    return <div>this is a test</div>;
  }

  // console.log(data.root);

  return (
    <div style={{
      width: 2000,
      height: 1000,
      marginTop: 50,
      padding: 15,
    }}
    >
      <ResponsiveBar
        data={barData}
        padding={0.3}
        // width={400}
        // height={800}
        margin={{
          top: 50, right: 130, bottom: 50, left: 60,
        }}
        indexBy="name"
        keys={[
          'DIRECTOR',
          'ADMIN',
          'WORKER',
          'CLIENT',
          'DEVELOPER',
        ]}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Organization',
          legendPosition: 'middle',
          legendOffset: -15,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Users',
          legendPosition: 'middle',
          legendOffset: 0,
        }}
        // identity="id"
        // value="value"
        // @ts-ignore
        // label={(node) => node.id}
        // orientLabel={false}
        // label="name"
        // colors={{ scheme: 'yellow_orange_red' }}
        // borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
      />
    </div>
  );

  // return (
  //   <div style={{
  //     width: 1500,
  //     height: 700,
  //     marginTop: 200,
  //   }}
  //   >
  //     <ResponsivePie
  //       data={pieData}
  //       // identity="id"
  //       // value="value"
  //       // @ts-ignore
  //       // label={(node) => node.id}
  //       // orientLabel={false}
  //       // label="name"
  //       // colors={{ scheme: 'yellow_orange_red' }}
  //       // borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
  //     />
  //   </div>
  // );

  // return (
  //   <div style={{
  //     width: 1000,
  //     height: 1000,
  //   }}
  //   >
  //     <ResponsiveTreeMapHtml
  //       data={data.root}
  //       identity="id"
  //       value="value"
  //       // @ts-ignore
  //       label={(node) => node.id}
  //       orientLabel={false}
  //       // label="name"
  //       // colors={{ scheme: 'yellow_orange_red' }}
  //       // borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
  //     />
  //   </div>
  // );

  // return <div><Cascader options={options} onChange={console.log} placeholder="Please select" /></div>;
};

export default OrganizationGraphs;
