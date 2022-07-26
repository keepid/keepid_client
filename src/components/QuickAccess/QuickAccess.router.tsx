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
          const { category } = props.match.params;
          console.log(`Category of quick-access is ${category}`);
          return <QuickAccessView category={category} />;
        }}
      />
      <Route
        path="/quick-access/:category/setup"
        exact
        render={(props) => {
          const { category } = props.match.params;
          console.log(`Category of quick-access setup is ${category}`);
          return <SetupQuickAccess category={category} />;
        }}
      />
    </>
  );
}
