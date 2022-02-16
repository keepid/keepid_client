import React from 'react';
import { Route } from 'react-router-dom';

import QuickAccessView from './QuickAccessView';
import SetupQuickAccess from './SetupQuickAccess';

export default function QuickAccessRouter() {
  return (
    <>
      <Route
        path="/quick-access/:category"
        exact
        render={(props) => {
          console.log('\n\nasdfasdf', '\n\n');
          const { category } = props.match.params;
          return <QuickAccessView category={category} />;
        }}
      />
      <Route
        path="/quick-access/:category/setup"
        exact
        render={(props) => {
          console.log('\n\nasdfasdf2', '\n\n');
          const { category } = props.match.params;
          return <SetupQuickAccess category={category} />;
        }}
      />
    </>
  );
}
