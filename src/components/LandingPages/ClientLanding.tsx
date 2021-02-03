import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import SignDoc from '../../static/images/sign-document.png';
import BaseCard, { CardImageLoc, CardSize } from '../Base/BaseCard';

interface Props extends RouteComponentProps {
  name: String
}

class ClientLanding extends Component<Props, {}, {}> {
  render() {
    const { name, history } = this.props;
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex p-2">
          <h1>
            Welcome,
            {' '}
            {name}
            !
          </h1>
        </div>
        <div className="row m-auto mt-5">
          <div className="d-flex p-2" id="Print container">
            <BaseCard cardTitle="Documents" cardText="Upload, view, and download your documents" buttonText="My Documents" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={SignDoc} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/my-documents'))} />
          </div>
          <div className="d-flex p-2" id="Applications container">
            <BaseCard cardTitle="Application" cardText="Upload, complete, and manage your applications" buttonText="My Applications" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={SignDoc} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/applications'))} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
