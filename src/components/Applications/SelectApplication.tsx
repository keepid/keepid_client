import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';

function SelectApplication() {
  return (
    <div className="container-fluid">
      <Helmet>
        <title>Create new application</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron jumbotron-fluid bg-white pb-0">
        <div className="container">
          <h1>Select Application here</h1>
        </div>
      </div>
    </div>
  );
}

export default SelectApplication;
