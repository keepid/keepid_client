import React from 'react';
import { Helmet } from 'react-helmet';
import EULA_PDF from '../../static/EULA.pdf';

interface State {}

class EULA extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>EULA</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">End User License Agreement</h1>
        </div>
        <div className="embed-responsive embed-responsive-16by9">
          <iframe className="embed-responsive-item" src="EULA.pdf" title="EULA Agreement" />
        </div>
      </div>
    );
  }
}

export default EULA;
