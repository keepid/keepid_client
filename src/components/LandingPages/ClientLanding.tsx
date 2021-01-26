import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import UploadSVG from '../../static/images/uploading-files-to-the-cloud.svg';
import RequestSVG from '../../static/images/request.svg';
import AppSVG from '../../static/images/calendar.svg';
import EmailSVG from '../../static/images/email.svg';
import FileSVG from '../../static/images/file.svg';
import SignDoc from '../../static/images/sign-document.png';
import BaseCard from '../Base/BaseCard';

interface Props extends RouteComponentProps {
  name: String
}

class ClientLanding extends Component<Props, {}, {}> {
  render() {
    const { name } = this.props;
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
            <BaseCard cardTitle="Documents" cardText="Upload, view, and download your documents" buttonText="My Documents" cardSize="small-horizontal" imageSrc={SignDoc} imageSize="50%" imageLoc="right" objectFit="contain" buttonOnClick={() => (this.props.history.push('/my-documents'))} />
          </div>
          <div className="d-flex p-2" id="Applications container">
            <BaseCard cardTitle="Application" cardText="Upload, complete, and manage your applications" buttonText="My Applications" cardSize="small-horizontal" imageSrc={SignDoc} imageSize="50%" imageLoc="right" objectFit="contain" buttonOnClick={() => (this.props.history.push('/applications'))} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
