import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';
import getServerURL from '../serverOverride';
import DefaultProfilePhoto from '../static/images/Solid_grey.svg';

interface Props{
  username:any,
}

interface State{
  activitiesArr: any,
  firstName: string,
  lastName: string,
  birthDate: string,
  address: string,
  city: string,
  state: string,
  email: string,
  organization: string,
  phone: string,
  zipcode: string,
  // showEditButton: boolean,
  file:File | undefined,
  response: boolean,
  photoAvailable: boolean,
  photo: any,
}

class ClientProfilePage extends Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      birthDate: '',
      address: '',
      city: '',
      state: '',
      email: '',
      organization: '',
      phone: '',
      zipcode: '',
      activitiesArr: null,
      file: undefined,
      response: false,
      photoAvailable: false,
      photo: null,
    };
    this.photoUploadHandler = this.photoUploadHandler.bind(this);
    this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    // this.loadProfilePhoto = this.loadProfilePhoto.bind(this);
    // this.renderClientInfo = this.renderClientInfo.bind(this);
  }

  fileSelectedHandler = (event:any) => {
    this.setState({
      file: event.target.files[0],
    });
  }

  photoUploadHandler = () => {
    const { file } = this.state;
    const { username } = this.props;
    const formData = new FormData();

    if (file !== undefined) {
      formData.append('file', file);
      formData.append('username', username);
    }

    // to see contents use ....
    // console.info(formData.getAll("file"));
    // console.info(formData.getAll("username"));

    fetch(`${getServerURL()}/upload-pfp`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { status } = responseObject;
        // console.log(`upload pfp responseObject: ${responseObject}`);
        if (status === 'SUCCESS') {
          // console.log('loadProfilePhoto should start');
          this.loadProfilePhoto();
        }
      });
  }

  loadProfilePhoto = () => {
    // console.log('loadProfilePhoto started');
    const { username } = this.props;

    fetch(`${getServerURL()}/load-pfp`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    }).then((response) => response.blob())
      .then((data) => {
        // console.log(data);
        const url = URL.createObjectURL(data);
        // console.log(url);
        if (url) {
          this.setState({
            response: true,
            photoAvailable: true,
            photo: url,
          });
        }

        // ATTEMPT #2
        /* console.log(window.webkitURL.createObjectURL(data))
        let reader = new FileReader();
        let photoURL;
        reader.readAsDataURL(data); // converts the blob to base64 and calls onload
        reader.onload = function(e) {
          if (e.target!=null){
            let photoURL = e.target.result;
            console.log(photoURL)
          }
          else{
            console.log("it was null")
          }
        }

        this.setState({
            response:true,
            photoAvailable: true,
            photo:photoURL,
        }) */
      });
  }

  componentDidMount = () => {
    const { username } = this.props;
    fetch(`${getServerURL()}/get-user-profile-info`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = responseJSON;
        const {
          firstName,
          lastName,
          birthDate,
          address,
          city,
          state,
          zipcode,
          email,
          organization,
          phone,
          // status,
        } = responseObject;

        this.setState({
          firstName,
          lastName,
          birthDate,
          address,
          city,
          state,
          zipcode,
          email,
          organization,
          phone,
        });
      })
      .then(() => {
        fetch(`${getServerURL()}/get-profile-activities`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username }),
        }).then((response) => response.json())
          .then((responseJSON) => {
            const responseObject = JSON.parse(responseJSON);
            this.setState({
              activitiesArr: responseObject.allActivities,
              response: true,
            });
          });
      })
      .then(() => { this.loadProfilePhoto(); });
  }

  renderActivities = (activitiesArr) => {
    /*
    const { username } = this.props;
    fetch(`${getServerURL()}/get-profile-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        this.setState({activitiesArr: responseObject.allActivities });
      }); */

    // const { activitiesArr } = this.state;
    if (activitiesArr.length === 0) {
      return (
        <div className="row w-125 p-2 text-dark">
          No activities
        </div>
      );
    }
    const row = activitiesArr.map((activity, i) => {
      const info = JSON.parse(activity.info);
      const name = `${info.owner.firstName} ${info.owner.lastName}`;
      const unparsedTime = info.occuredAt.$date;
      const date = new Date(unparsedTime);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = date.getFullYear();
      const month = months[date.getMonth()];
      const day = date.getDate();
      const hour = date.getHours();
      const min = date.getMinutes();
      const time = `${day} ${month} ${year} ${hour}:${min}`;
      if (i === activitiesArr.length - 1) {
        return (
          <div className="row w-125 p-2 text-dark" key={activity.toString()}>
            <div className="row">
              <div className="col text-left ml-3 font-weight-bold">{activity.type}</div>
              <div className="col text-right mr-3">{name}</div>
            </div>
            <div className="row">
              <div className="col text-left ml-3">{time}</div>
              <div className="col text-right mr-3" />
            </div>
          </div>
        );
      }

      return (
        <div
          className="row w-125 p-2 text-dark" // key={activity.toString()}
          key={Math.random()}
          style={{
            borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid', borderTop: 0, borderRight: 0, borderLeft: 0,
          }}
        >
          <div className="row">
            <div className="col text-left ml-3 font-weight-bold">{activity.type}</div>
            <div className="col text-right mr-3">{name}</div>
          </div>
          <div className="row">
            <div className="col text-left ml-3">{time}</div>
            <div className="col text-right mr-3" />
          </div>
        </div>
      );
    });
    return row;
  }

  render() {
    const {
      firstName,
      lastName,
      birthDate,
      address,
      city,
      state,
      zipcode,
      email,
      organization,
      phone,
      activitiesArr,
      response,
      photoAvailable,
      photo,
    } = this.state;
    const { username } = this.props;

    return (
      <div className="container">
        <div className="modal fade" id="exampleModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <h5 className="modal-title" id="exampleModalLongTitle">Change Profile Photo</h5>
              <input type="file" name="file" id="file" onChange={this.fileSelectedHandler} />
              {/* <button type="button" onClick={this.photoUploadHandler}>Upload Photo</button> */}
              <button type="submit" onClick={this.photoUploadHandler}>Upload Photo</button>
            </div>
          </div>
        </div>
        <h1 className="m-3 font-weight-bold">
          {username}
          &apos;s Profile
        </h1>
        <div className="d-flex flex-row">
          <div className="rounded w-50 h-75 px-5 container mr-4 text-dark" style={{ borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid' }}>
            <div className="container">
              { response === false || photoAvailable === false
                ? <Image src={DefaultProfilePhoto} className="w-75 pt-2 mx-auto d-flex" alt="profile photo" roundedCircle /> : (
                  <div>
                    {' '}
                    <img src={photo} className="w-75 pt-2 mx-auto d-flex" alt="profile" />
                    {' '}
                    <Image src={photo} className="w-75 pt-2 mx-auto d-flex" alt="profile photo" roundedCircle />
                    {' '}
                  </div>
                )}
              {/* //attempt for edit icon
              <Image src={CheckSVG} className="w-100 pt-2 mx-auto border position-relative" alt="search"
                style={{ top: '0', left:'0', zIndex:1, height: '10rem' }} roundedCircle/>
              */}
            </div>
            <div>
              <h3 className="font-weight-bold mt-3 text-center">
                {firstName}
                {' '}
                {lastName}
              </h3>
              <div className="row">
                <div className="col font-weight-bold">Username</div>
                <div className="col text-right">{username}</div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Password</div>
                <div className="col text-right">******</div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Birthdate</div>
                <div className="col text-right">{birthDate}</div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Phone No.</div>
                <div className="col text-right">{phone}</div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Email</div>
                <div className="col text-right">{email}</div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Address</div>
                <div className="col text-right">
                  {address}
                  {' '}
                  {city}
                  ,
                  {' '}
                  {state}
                  {' '}
                  {zipcode}
                </div>
              </div>
              <div className="row">
                <div className="col font-weight-bold">Organization</div>
                <div className="col text-right">{organization}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn m-2 ml-4 font-weight-bold"
              style={{
                color: '#7B81FF', borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid',
              }}
              // onClick={this.editInformation}
              data-toggle="modal"
              data-target="#exampleModal"
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
              { activitiesArr === null ? <div className="row w-125 p-2 text-dark"> Loading ... </div> : this.renderActivities(activitiesArr)}
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default (ClientProfilePage);
