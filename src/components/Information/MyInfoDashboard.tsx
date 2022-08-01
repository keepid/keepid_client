import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import BasicInfo from '../../static/images/basic-rafiki.png';
import DemographicInfo from '../../static/images/demographic-rafiki.png';
import FamilyInfo from '../../static/images/penguinfam-rafiki.png';
import VeteranInfo from '../../static/images/veteran-rafiki.png';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';

interface Props extends RouteComponentProps {
    name: String;
    username: String;
  }

  interface State {
    isLoading: Boolean;
  }

class MyInfoDashboard extends Component<Props, State, {}> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  render() {
    const { name, username, history } = this.props;
    const { isLoading } = this.state;
    return (
            <div id="Buttons" className="container pt-5">
                <Helmet>
                    <title>My Information</title>
                    <meta name="description" content="Keep.id" />
                </Helmet>
                <div className="d-flex px-2 pt-2">
                    <h1 id="welcome-title">{name}&apos;s Information</h1>
                    <Link to="/home"><button type="button" className="btn btn-primary ml-3 mt-2" style={{ height: 36 }}><div className="upload-text-style">Return Home</div></button></Link>
                </div>
                <div className="d-flex p-2">
                    Keep.id uses the information below to fill in your applications quicker. Your information is protected by Cloudfare and HIPAA compliance.
                </div>
                <div className="row m-auto mt-5">
                    <div className="d-flex pt-2" id="Print container">
                        <BaseCard
                          cardTitle="Basic Information"
                          cardText="Information such as middle name, gender, and SSN."
                          buttonText="View"
                          cardSize={CardSize.XSMALL_VERTICAL}
                          imageSrc={BasicInfo}
                          imageSize="50%"
                          imageLoc={CardImageLoc.TOP}
                          imageObjectFit="contain"
                          buttonOnClick={() => history.push(`/basic-info/${username}/${name.split(' ').join('+')}`)}
                        />
                        <BaseCard
                          cardTitle="Family"
                          cardText="Information about your immediate family members."
                          buttonText="View"
                          cardSize={CardSize.XSMALL_VERTICAL}
                          imageSrc={FamilyInfo}
                          imageSize="50%"
                          imageLoc={CardImageLoc.TOP}
                          imageObjectFit="contain"
                          buttonOnClick={() => history.push(`/family-info/${username}/${name.split(' ').join('+')}`)}
                        />
                        <BaseCard
                          cardTitle="Demographics"
                          cardText="Information such as birthplace and race."
                          buttonText="View"
                          cardSize={CardSize.XSMALL_VERTICAL}
                          imageSrc={DemographicInfo}
                          imageSize="50%"
                          imageLoc={CardImageLoc.TOP}
                          imageObjectFit="contain"
                          buttonOnClick={() => history.push(`/demographics/${username}/${name.split(' ').join('+')}`)}
                        />
                        <BaseCard
                          cardTitle="Veteran Status"
                          cardText="Information about your veteran status and service."
                          buttonText="View"
                          cardSize={CardSize.XSMALL_VERTICAL}
                          imageSrc={VeteranInfo}
                          imageSize="50%"
                          imageLoc={CardImageLoc.TOP}
                          imageObjectFit="contain"
                          buttonOnClick={() => history.push(`/veteran-status/${username}/${name.split(' ').join('+')}`)}
                        />
                    </div>
                </div>
            </div>
    );
  }
}

export default withRouter(MyInfoDashboard);
