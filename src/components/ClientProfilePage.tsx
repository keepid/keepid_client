import React, { Component } from 'react';
// import Alert from 'react-bootstrap/Alert';
import { withAlert } from 'react-alert';
import Image from 'react-bootstrap/Image';
import Cropper from 'react-easy-crop';
import getServerURL from '../serverOverride';
import DefaultProfilePhoto from '../static/images/Solid_grey.svg';

interface Props{
  username:any,
  alert:any,
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
  file:File | undefined | null | any,
  // response: boolean,
  photoAvailable: boolean,
  photo: any,
  crop: any,
  zoom: number,
  aspect: any,
  showCropper: boolean,
  fileSelected: any,
  inputKey: any,
  croppedAreaPixels: number,
  loading: boolean,
}

class ClientProfilePage extends Component<Props, State> {
  private hiddenFileInput: React.RefObject<HTMLInputElement>;

  private controllerRef: React.MutableRefObject<AbortController | null>;
  // abortController = new AbortController();
  // signal = this.abortController.signal;

  constructor(props:Props) {
    super(props);
    this.hiddenFileInput = React.createRef();
    this.controllerRef = React.createRef();
    // var controller = new AbortController();
    // var signal = controller.signal;

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
      // response: false,
      photoAvailable: false,
      photo: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: 1 / 1,
      showCropper: false,
      fileSelected: null,
      inputKey: 0,
      croppedAreaPixels: 0,
      loading: false,
    };

    this.photoUploadHandler = this.photoUploadHandler.bind(this);
    this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    this.loadProfilePhoto = this.loadProfilePhoto.bind(this);
    this.readFile = this.readFile.bind(this);
    this.getCroppedImg = this.getCroppedImg.bind(this);
    this.dataURItoBlob = this.dataURItoBlob.bind(this);
    this.cropAndSave = this.cropAndSave.bind(this);
  }

  componentDidMount = () => {
    if (this.controllerRef.current) {
      this.controllerRef.current.abort();
    }

    const { username } = this.props;
    const abortController = new AbortController();
    this.controllerRef.current = abortController;
    const signal = this.controllerRef.current?.signal;
    // const signal = abortController.signal;

    fetch(`${getServerURL()}/get-user-info`, {
      signal,
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
      .then(() => this.loadProfilePhoto())
      .then(() => {
        fetch(`${getServerURL()}/get-all-activities`, {
          signal,
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username }),
        }).then((response) => response.json())
          .then((responseJSON) => {
            const responseObject = responseJSON;
            const activitiesArr = responseObject.activities.allActivities;
            this.setState({
              activitiesArr,
              // response: true,
            });
          });
      });
  }

  componentWillUnmount = () => {
    if (this.controllerRef.current) {
      this.controllerRef.current.abort();
    }
  }

  loadProfilePhoto = () => {
    const { username } = this.props;
    const signal = this.controllerRef.current?.signal;

    fetch(`${getServerURL()}/load-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    }).then((response) => response.blob())
      .then((blob) => {
        const url = (URL || window.webkitURL).createObjectURL(blob);
        if (url) {
          this.setState({
            photoAvailable: true,
            photo: url,
          });
        }
      });
  }

  fileSelectedHandler = async (event:any) => {
    const file = event.target.files[0];
    try {
      const imageDataUrl = await this.readFile(file);
      this.setState({
        fileSelected: imageDataUrl,
        showCropper: true,
      });
    } catch (e) {
      const { alert } = this.props;
      alert.show(`Trouble SelectingFile. Try Again or Report This Error To Keep.id: ${e}`);
    }
  }

  readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  })

  onZoomChange = (zoom) => {
    this.setState({ zoom });
  }

  onCropChange = (crop) => {
    this.setState({ crop });
  }

  onCropComplete = async (croppedArea, croppedAreaPixels) => {
    this.setState({
      croppedAreaPixels,
    });
  }

  cropAndSave = async () => {
    try {
      const { fileSelected, croppedAreaPixels } = this.state;
      const croppedImage = await this.getCroppedImg(fileSelected, croppedAreaPixels);
      this.setState({
        file: croppedImage,
      }, () => {
        this.photoUploadHandler();
      });
    } catch (e) {
      const { alert } = this.props;
      alert.show(`Could Not Crop Photo. Report This Error To Keep.id: ${e}`);
    }
  }

  getCroppedImg = (imageSrc, pixelCrop) => {
    const image = new (window as any).Image();
    image.src = imageSrc;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.id = 'croppedPhoto';
    canvas.width = safeArea;
    canvas.height = safeArea;

    if (ctx) {
      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5,
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
      );
    }

    const dataURL = canvas.toDataURL('image/jpg');
    const file = this.dataURItoBlob(dataURL);
    return file;
  }

  photoUploadHandler = () => {
    const { file } = this.state;
    const { username } = this.props;
    const formData = new FormData();
    const signal = this.controllerRef.current?.signal;

    if (file !== undefined) {
      formData.append('file', file);
      formData.append('username', username);
    }

    // to see contents use ....
    // console.info(formData.getAll("file"));

    fetch(`${getServerURL()}/upload-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then((response) => response.json())
      .then((responseJSON) => {
        try {
          const responseObject = responseJSON;
        } catch (e) {
          const { alert } = this.props;
          alert.show(`Could Not Upload Photo. Report This Error To Keep.id: ${e}`);
        }
        this.setState({ loading: false });
      })
      .then(() => this.loadProfilePhoto());
  }

  dataURItoBlob = (dataURI) => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
    else byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  renderActivities = (activitiesArr) => {
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
          className="row w-125 p-2 text-dark"
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
      photoAvailable,
      photo,
      showCropper,
      fileSelected,
      inputKey,
      loading,
      crop,
      zoom,
      aspect,
    } = this.state;
    const { username } = this.props;

    return (
      <div className="container">
        <div className="modal fade" id="exampleModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <h3 className="modal-title text-center mt-3 mb-2" id="ChangeProfilePhoto">Change Profile Photo</h3>
              <button
                type="button"
                className="btn mb-2 mx-4 font-weight-bold"
                style={{
                  color: '#7B81FF', borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid',
                }}
                onClick={() => this.hiddenFileInput.current!.click()}
              >
                Select Photo
              </button>
              <input
                style={{ display: 'none' }}
                type="file"
                key={inputKey}
                ref={this.hiddenFileInput}
                onChange={this.fileSelectedHandler}
                accept=".jpg,.jpeg,.png"
              />

              { showCropper
                  && (
                  <div className="position-relative py-5 mx-2">
                    <div className="crop-container py-5">
                      <Cropper
                        image={fileSelected}
                        // image = {Melinda}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={this.onCropChange}
                        onCropComplete={this.onCropComplete}
                        onZoomChange={this.onZoomChange}
                        cropShape="round"
                        showGrid={false}
                      />
                    </div>
                  </div>
                  ) }

              <button
                className="btn mt-2 mb-3 mx-4 font-weight-bold ld-ext-right"
                style={{
                  color: '#7B81FF', borderColor: '#7B81FF', borderWidth: 1, borderStyle: 'solid',
                }}
                type="submit"
                onClick={() => { this.setState({ loading: true }, () => { this.cropAndSave(); }); }}
              >
                Set Profile Photo
                {loading && (<div><div className="ld ld-ring ld-spin" /></div>)}
              </button>
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
              { photoAvailable === false
                ? <Image src={DefaultProfilePhoto} className="w-75 pt-2 mx-auto d-flex" alt="profile photo" roundedCircle /> : (
                  <div id="profilePhoto">
                    <Image src={photo} className="w-75 pt-2 mx-auto d-flex" alt="profile photo" roundedCircle />
                  </div>
                )}
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
              data-toggle="modal"
              data-target="#exampleModal"
              onClick={() => this.setState({ showCropper: false, inputKey: Date.now() })}
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

export default withAlert()(ClientProfilePage);
