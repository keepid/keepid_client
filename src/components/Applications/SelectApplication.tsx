import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

function SelectApplication() {
  return (
    <Switch>
      <Route exact path="/applications/createnew">
        <h1>Hello!</h1>
      </Route>
    </Switch>
  );
}

export default SelectApplication;
