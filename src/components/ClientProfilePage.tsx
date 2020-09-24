import React, { Component } from 'react';
import getServerURL from '../serverOverride';

interface Props{
  username: string,
}

interface State{
  activitiesArr: any,
}

class ClientProfilePage extends Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      activitiesArr: [{ person: 'Melinda Cardenas', action: 'Sent 3 Applications', dateOfAction: 'August 24th' }, { person: 'Yoav Zur', action: 'Uploaded 3 Docs', dateOfAction: 'August 25th' }],
    };
  }

  renderActivities = () => {
    const { username } = this.props;
    // fetch call to get activitiesArr
    fetch(`${getServerURL()}/get-all-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        console.log(responseObject);
      });

    const { activitiesArr } = this.state;

    const row = this.state.activitiesArr.map((activity, i) => {
      if (i === activitiesArr.length - 1) {
        return (
          <div className="row w-125 p-2 text-dark" key={activity.toString()}>
            <div className="row">
              <div className="col text-left ml-3 font-weight-bold">{activity.action}</div>
              <div className="col text-right mr-3">{activity.person}</div>
            </div>
            <div className="row">
              <div className="col text-left ml-3">{activity.dateOfAction}</div>
              <div className="col text-right mr-3" />
            </div>
          </div>
        );
      }

      return (
        <div
          className="row w-125 p-2 text-dark"
          key={activity.toString()}
          style={{
            borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid', borderTop: 0, borderRight: 0, borderLeft: 0,
          }}
        >
          <div className="row">
            <div className="col text-left ml-3 font-weight-bold">{activity.action}</div>
            <div className="col text-right mr-3">{activity.person}</div>
          </div>
          <div className="row">
            <div className="col text-left ml-3">{activity.dateOfAction}</div>
            <div className="col text-right mr-3" />
          </div>
        </div>
      );
    });
    return row;
  }

  render() {
    return (
      <div className="container">
        <h1 className="m-3 font-weight-bold">Your Profile</h1>
        <div className="d-flex flex-row">
          <div className="rounded w-50 h-75 px-5 container mr-4 text-dark" style={{ borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid' }}>
            <h3 className="font-weight-bold mt-3">Melinda Cardenas</h3>
            <div className="row">
              <div className="col">Username</div>
              <div className="col">burningjournal</div>
            </div>
            <div className="row">
              <div className="col">Password</div>
              <div className="col">******</div>
            </div>
            <div className="row">
              <div className="col">Birthdate</div>
              <div className="col">01/01/98</div>
            </div>
            <div className="row">
              <div className="col">Phone No.</div>
              <div className="col">1234567890</div>
            </div>
            <div className="row">
              <div className="col">Email</div>
              <div className="col">lala@gmail.com</div>
            </div>
            <div className="row">
              <div className="col">Address</div>
              <div className="col">123 park ave. new york, ny, 10003</div>
            </div>
            <div className="row">
              <div className="col">Organization</div>
              <div className="col">Keep.id</div>
            </div>
            <button
              type="button"
              className="btn m-2 ml-4 font-weight-bold"
              style={{
                color: '#7B81FF', borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid',
              }}
            >
              Edit Your Information
            </button>
          </div>

          <div className="d-flex flex-column w-50 h-75 text-dark">
            <div className="rounded-top" style={{ borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid' }}>
              <h3 className="font-weight-bold mt-3 text-center">Recent Activity</h3>
            </div>
            <div
              className="rounded-bottom border-top-0 text-center container"
              style={{
                borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid', borderTop: 0,
              }}
            >
              {this.state.activitiesArr ? this.renderActivities() : <p>no activities yet...</p>}
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default (ClientProfilePage);
